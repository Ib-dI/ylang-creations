import { order } from "@/db/schema";
import { db } from "@/lib/db";
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

      // Get metadata
      const metadata = session.metadata;

      if (!metadata?.customerId || !metadata?.items) {
        console.error("❌ Missing metadata in session");
        break;
      }

      // Parse items
      let items;
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
        await db.insert(order).values({
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
          shippingAddress: session.collected_information?.shipping_details
            ? JSON.stringify(session.collected_information.shipping_details)
            : null,
          items: JSON.stringify(items),
          createdAt: now,
          updatedAt: now,
        });

        console.log("✅ Order created:", orderId);

        // Optional: Send confirmation emails
        // You can uncomment this when email templates are set up
        /*
        const customerRecord = await db
          .select()
          .from(customer)
          .where(eq(customer.id, metadata.customerId))
          .limit(1);

        if (customerRecord.length > 0) {
          await sendOrderConfirmationEmail({
            to: customerRecord[0].email,
            orderNumber: orderId.slice(0, 8).toUpperCase(),
            customerName: customerRecord[0].name || "Client",
            items: items,
            total: (session.amount_total ?? 0) / 100,
            shipping: 0,
            shippingAddress: session.shipping_details?.address || {},
          });
        }
        */
      } catch (err) {
        console.error("❌ Failed to create order:", err);
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
