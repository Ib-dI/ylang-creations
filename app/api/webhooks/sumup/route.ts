import { customer, order, product } from "@/db/schema";
import { db } from "@/lib/db";
import { getSumupHeaders, SUMUP_API_URL } from "@/lib/sumup";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import type { CartItem } from "@/types/cart";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function orderNumberFromId(orderId: string): string {
  return `YC${orderId.slice(0, 8).toUpperCase()}`;
}

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
  items: CartItem[],
): Promise<void> {
  const orderNumber = orderNumberFromId(orderId);
  const adminEmail = process.env.ADMIN_EMAIL || "contact@ylang-creations.fr";

  const itemsHtml = items
    .map((item) => {
      const details = [
        `Tissu : ${escapeHtml(item.configuration.fabricName)}`,
        item.configuration.size && `Taille : ${escapeHtml(item.configuration.size)}`,
        item.configuration.selectedColorName &&
          `Couleur : ${escapeHtml(item.configuration.selectedColorName)}`,
        item.configuration.embroidery && `Broderie : "${escapeHtml(item.configuration.embroidery)}"`,
        item.configuration.embroideryFont &&
          `Police : ${escapeHtml(item.configuration.embroideryFont)}`,
        item.configuration.embroideryColor &&
          `Fil : ${escapeHtml(item.configuration.embroideryColorName ?? item.configuration.embroideryColor)}`,
      ]
        .filter(Boolean)
        .join(" — ");
      return `<li><strong>${escapeHtml(item.productName)}</strong> (x${item.quantity})<br/>${details}</li>`;
    })
    .join("");

  await resend.emails.send({
    from: "Ylang Créations <contact@ylang-creations.fr>",
    to: adminEmail,
    subject: `Nouvelle commande ! (${orderNumber})`,
    html: `
      <p>Nouvelle commande <strong>${orderNumber}</strong> reçue via SumUp. Montant : ${amount} EUR.</p>
      <ul>${itemsHtml}</ul>
    `,
  });
}

async function sendCustomerConfirmationEmail(
  orderId: string,
  customerId: string,
  totalAmountCents: number,
  items: CartItem[],
): Promise<void> {
  const customerRows = await db
    .select({ email: customer.email, name: customer.name })
    .from(customer)
    .where(eq(customer.id, customerId))
    .limit(1);
  const customerRow = customerRows[0];
  if (!customerRow) return;

  // Le tunnel de commande ne stocke pas encore de découpage sous-total/livraison,
  // donc on le recalcule à partir du prix des articles vs. le montant total payé.
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = Math.max(0, totalAmountCents / 100 - subtotal);

  await sendOrderConfirmationEmail({
    to: customerRow.email,
    orderNumber: orderNumberFromId(orderId),
    customerName: customerRow.name || "Client",
    items: items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      configuration: {
        fabricName: item.configuration.fabricName,
        embroidery: item.configuration.embroidery,
        embroideryFont: item.configuration.embroideryFont,
        embroideryColor: item.configuration.embroideryColor,
        embroideryColorName: item.configuration.embroideryColorName,
      },
    })),
    total: subtotal,
    shipping,
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

      const items = Array.isArray(existingOrder.items)
        ? (existingOrder.items as CartItem[])
        : [];

      if (items.length > 0) {
        await decrementStock(items);
      }

      try {
        await sendAdminOrderEmail(orderId, verified.amount, items);
      } catch (emailError) {
        console.error("[SumUp Webhook] Error sending admin email:", emailError);
      }

      try {
        await sendCustomerConfirmationEmail(
          orderId,
          existingOrder.customerId,
          existingOrder.totalAmount,
          items,
        );
      } catch (emailError) {
        console.error("[SumUp Webhook] Error sending customer confirmation email:", emailError);
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
