import { order, product } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const sumupApiUrl = "https://api.sumup.com/v0.1";

const sumupHeaders = {
  Authorization: `Bearer ${process.env.SUMUP_SECRET_KEY}`,
  "Content-Type": "application/json",
};

export async function POST(req: Request) {
  try {
    console.log("📥 [SumUp Webhook] Received webhook event");

    const body = await req.json();
    console.log("📥 [SumUp Webhook] Body:", JSON.stringify(body, null, 2));

    const checkoutId = body.id;

    if (!checkoutId) {
      console.warn("⚠️ [SumUp Webhook] Missing checkout ID in payload");
      return new NextResponse("Invalid payload", { status: 400 });
    }

    // Always fetch the latest checkout status from SumUp API to avoid spoofing
    const sumupResponse = await fetch(
      `${sumupApiUrl}/checkouts/${checkoutId}`,
      {
        method: "GET",
        headers: sumupHeaders,
      },
    );

    if (!sumupResponse.ok) {
      console.error("❌ [SumUp Webhook] Failed to verify checkout with SumUp");
      return new NextResponse("Verification failed", { status: 400 });
    }

    const verifiedCheckout = await sumupResponse.json();
    const verifiedStatus = verifiedCheckout.status;
    const verifiedOrderReference = verifiedCheckout.checkout_reference; // This is our local order.id

    console.log(
      `🔍 [SumUp Webhook] Verified status for ${checkoutId}: ${verifiedStatus}`,
    );

    if (verifiedStatus === "PAID") {
      // Find the order in our database
      const existingOrderResult = await db
        .select()
        .from(order)
        .where(eq(order.id, verifiedOrderReference))
        .limit(1);

      if (existingOrderResult.length === 0) {
        console.error(
          `❌ [SumUp Webhook] Order not found for reference: ${verifiedOrderReference}`,
        );
        return new NextResponse("Order not found", { status: 404 });
      }

      const existingOrder = existingOrderResult[0];

      // Idempotency check
      if (existingOrder.status !== "pending") {
        console.log(
          `⚠️ [SumUp Webhook] Order ${verifiedOrderReference} is already processed (status: ${existingOrder.status})`,
        );
        return new NextResponse("Already processed", { status: 200 });
      }

      console.log(
        `✅ [SumUp Webhook] Processing payment for order ${verifiedOrderReference}`,
      );

      // 1. Update order status
      await db
        .update(order)
        .set({
          status: "paid",
          sumupTransactionId:
            verifiedCheckout.transactions?.[0]?.transaction_code || null,
          updatedAt: new Date(),
        })
        .where(eq(order.id, verifiedOrderReference));

      // 2. Decrement stock for all items
      const items = existingOrder.items as any[];
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.productId) {
            console.log(
              `📦 [SumUp Webhook] Decrementing stock for product ${item.productId} by ${item.quantity}`,
            );
            await db
              .update(product)
              .set({
                stock: sql`GREATEST(${product.stock} - ${item.quantity}, 0)`,
                updatedAt: new Date(),
              })
              .where(eq(product.id, item.productId));
          }
        }
      }

      // 3. Send confirmation emails
      try {
        const orderNumber = `YC${verifiedOrderReference.slice(0, 8).toUpperCase()}`;
        const adminEmail =
          process.env.ADMIN_EMAIL || "contact@ylang-creations.fr";

        await resend.emails.send({
          from: "Ylang Créations <contact@ylang-creations.fr>",
          to: adminEmail,
          subject: `Nouvelle commande ! (${orderNumber})`,
          html: `<p>Nouvelle commande <strong>${orderNumber}</strong> reçue via SumUp. Montant : ${verifiedCheckout.amount} EUR.</p>`,
        });

        console.log("✅ [SumUp Webhook] Admin email sent successfully");
      } catch (emailError) {
        console.error("❌ [SumUp Webhook] Error sending emails:", emailError);
        // Don't fail the webhook because of email errors
      }
    } else if (
      verifiedStatus === "FAILED" ||
      verifiedStatus === "CANCELLED"
    ) {
      console.log(
        `❌ [SumUp Webhook] Payment failed or cancelled for order ${verifiedOrderReference}`,
      );

      await db
        .update(order)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(order.id, verifiedOrderReference));
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("❌ [SumUp Webhook] Unexpected error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
