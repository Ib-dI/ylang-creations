import { order, product } from "@/db/schema";
import { db } from "@/lib/db";
import { getSumupHeaders, SUMUP_API_URL } from "@/lib/sumup";
import type { CartItem } from "@/types/cart";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface VerifiedCheckout {
  status: string;
  checkout_reference: string;
  amount: number;
  transactions?: Array<{ transaction_code: string }>;
}

async function verifyPaymentWithSumup(
  checkoutId: string,
): Promise<VerifiedCheckout | null> {
  const response = await fetch(`${SUMUP_API_URL}/checkouts/${checkoutId}`, {
    method: "GET",
    headers: getSumupHeaders(),
  });
  if (!response.ok) return null;
  return response.json() as Promise<VerifiedCheckout>;
}

async function markOrderPaid(
  orderId: string,
  transactionCode: string | null,
): Promise<void> {
  await db
    .update(order)
    .set({
      status: "paid",
      sumupTransactionId: transactionCode,
      updatedAt: new Date(),
    })
    .where(eq(order.id, orderId));
}

async function decrementStock(items: CartItem[]): Promise<void> {
  for (const item of items) {
    if (!item.productId) continue;
    await db
      .update(product)
      .set({
        stock: sql`GREATEST(${product.stock} - ${item.quantity}, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(product.id, item.productId));
  }
}

async function sendAdminOrderEmail(
  orderId: string,
  amount: number,
): Promise<void> {
  const orderNumber = `YC${orderId.slice(0, 8).toUpperCase()}`;
  const adminEmail = process.env.ADMIN_EMAIL || "contact@ylang-creations.fr";

  await resend.emails.send({
    from: "Ylang Créations <contact@ylang-creations.fr>",
    to: adminEmail,
    subject: `Nouvelle commande ! (${orderNumber})`,
    html: `<p>Nouvelle commande <strong>${orderNumber}</strong> reçue via SumUp. Montant : ${amount} EUR.</p>`,
  });
}

async function markOrderCancelled(orderId: string): Promise<void> {
  await db
    .update(order)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(order.id, orderId));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const checkoutId = body.id;

    if (!checkoutId) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const verified = await verifyPaymentWithSumup(checkoutId);
    if (!verified) {
      return new NextResponse("Verification failed", { status: 400 });
    }

    const { status, checkout_reference: orderId } = verified;

    if (status === "PAID") {
      const existingOrderResult = await db
        .select()
        .from(order)
        .where(eq(order.id, orderId))
        .limit(1);

      if (existingOrderResult.length === 0) {
        return new NextResponse("Order not found", { status: 404 });
      }

      const existingOrder = existingOrderResult[0];

      if (existingOrder.status !== "pending") {
        return new NextResponse("Already processed", { status: 200 });
      }

      const transactionCode =
        verified.transactions?.[0]?.transaction_code ?? null;

      await markOrderPaid(orderId, transactionCode);

      if (Array.isArray(existingOrder.items)) {
        await decrementStock(existingOrder.items as CartItem[]);
      }

      try {
        await sendAdminOrderEmail(orderId, verified.amount);
      } catch (emailError) {
        console.error("[SumUp Webhook] Error sending email:", emailError);
      }
    } else if (status === "FAILED" || status === "CANCELLED") {
      await markOrderCancelled(orderId);
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("[SumUp Webhook] Unexpected error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
