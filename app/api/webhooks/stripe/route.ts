import { customer as customerTable, order, product } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Force Node.js runtime for database connections
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("❌ Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("✅ Checkout session completed:", session.id);
      console.log(
        "📦 Metadata received:",
        JSON.stringify(session.metadata, null, 2),
      );

      // Get metadata
      const metadata = session.metadata;

      if (!metadata?.customerId || !metadata?.items) {
        console.error("❌ Missing or incomplete metadata in session:", {
          customerId: !!metadata?.customerId,
          items: !!metadata?.items,
        });
        break;
      }

      // Parse items
      let items: any[] = [];
      try {
        items = JSON.parse(metadata.items);
      } catch {
        console.error("❌ Failed to parse items from metadata");
        break;
      }

      // Create order in database
      const orderId = crypto.randomUUID();
      const now = new Date();

      try {
        // Start a transaction to ensure order creation and stock update happen together
        await db.transaction(async (tx) => {
          console.log("📝 Creating order and updating stock in database...");

          // Verify customer exists
          const existingCustomer = await tx
            .select()
            .from(customerTable) // Use imported alias to avoid conflicts
            .where(eq(customerTable.id, metadata.customerId))
            .limit(1);

          if (existingCustomer.length === 0) {
            throw new Error(
              `Customer not found with ID: ${metadata.customerId}`,
            );
          }

          // 1. Create order
          await tx.insert(order).values({
            id: orderId,
            customerId: metadata.customerId,
            stripeSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : (session.payment_intent?.id ?? null),
            status: "paid",
            totalAmount: String(session.amount_total ?? 0),
            currency: session.currency ?? "eur",
            shippingAddress: (session as any).shipping_details
              ? JSON.stringify((session as any).shipping_details)
              : session.customer_details
                ? JSON.stringify(session.customer_details)
                : null,
            items: JSON.stringify(items),
            createdAt: now,
            updatedAt: now,
          });

          // 2. Decrement stock for each item
          for (const item of items) {
            if (item.productId && item.quantity) {
              console.log(
                `📉 Decrementing stock for product ${item.productId} by ${item.quantity}`,
              );

              await tx
                .update(product)
                .set({
                  stock: sql`GREATEST(0, CAST(${product.stock} AS INTEGER) - ${item.quantity})::text`,
                  updatedAt: now,
                })
                .where(eq(product.id, item.productId));
            }
          }
        });

        console.log("✅ Order created and stock updated:", orderId);
      } catch (err) {
        console.error("❌ Failed to create order or update stock:", err);
        // CRITICAL: Return 500 so Stripe retries the webhook
        return NextResponse.json(
          {
            error: "Database operation failed",
            details: err instanceof Error ? err.message : "Unknown error",
          },
          { status: 500 },
        );
      }

      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("✅ Payment intent succeeded:", paymentIntent.id);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(
        "❌ Payment failed:",
        paymentIntent.id,
        paymentIntent.last_payment_error?.message,
      );
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
