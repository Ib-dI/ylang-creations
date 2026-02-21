import { order, product, settings } from "@/db/schema";
import { db } from "@/lib/db";
import {
  sendAdminNotificationEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email/send-order-confirmation";
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

      if (!metadata?.orderId) {
        console.error("❌ Missing orderId in session metadata:", session.id);
        break;
      }

      const orderId = metadata.orderId;
      let items: any[] = [];

      try {
        // Start a transaction to ensure order update and stock update happen together
        await db.transaction(async (tx) => {
          console.log(`📝 Updating order ${orderId} and stock in database...`);

          // 1. Find the existing pending order
          const existingOrder = await tx
            .select()
            .from(order)
            .where(eq(order.id, orderId))
            .limit(1);

          if (existingOrder.length === 0) {
            throw new Error(`Order not found with ID: ${orderId}`);
          }

          const orderData = existingOrder[0];

          // Parse items from the locally stored order
          try {
            items = (orderData.items as any[]) ?? [];
          } catch {
            throw new Error(`Failed to read items for order: ${orderId}`);
          }

          // 2. Update order status and details
          await tx
            .update(order)
            .set({
              stripeSessionId: session.id, // Ensure it's set
              stripePaymentIntentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : (session.payment_intent?.id ?? null),
              status: "paid",
              shippingAddress: (session as any).shipping_details
                ? (session as any).shipping_details
                : session.customer_details
                  ? session.customer_details
                  : orderData.shippingAddress,
              updatedAt: new Date(),
            })
            .where(eq(order.id, orderId));

          // 3. Decrement stock for each item
          for (const item of items) {
            const productId = item.productId;
            const quantity = item.quantity;

            if (productId && quantity) {
              console.log(
                `📉 Decrementing stock for product ${productId} by ${quantity}`,
              );

              await tx
                .update(product)
                .set({
                  stock: sql`GREATEST(0, ${product.stock} - ${quantity})`,
                  updatedAt: new Date(),
                })
                .where(eq(product.id, productId));
            }
          }
        });

        console.log("✅ Order created and stock updated:", orderId);

        // ============================================
        // ENVOI EMAIL DE CONFIRMATION
        // ============================================
        try {
          const customerEmail = session.customer_details?.email;
          const customerName = session.customer_details?.name || "Client";

          // Parse shipping address from Stripe session
          const shippingDetails = (session as any).shipping_details?.address;

          if (customerEmail && shippingDetails) {
            console.log("📧 Sending confirmation email to:", customerEmail);

            // Map items to email format
            const emailItems = items.map((item: any) => ({
              productName: item.name || item.productName || "Produit",
              quantity: item.quantity || 1,
              price: item.price || 0,
              configuration: {
                fabricName:
                  item.configuration?.fabricName ||
                  item.configuration?.fabric?.name ||
                  "Standard",
                embroidery: item.configuration?.embroidery || undefined,
                accessories:
                  item.configuration?.accessories?.map((a: any) =>
                    typeof a === "string" ? a : a.name,
                  ) || [],
              },
            }));

            // Calculate subtotal (amount_total is in cents)
            const total = (session.amount_total ?? 0) / 100;

            await sendOrderConfirmationEmail({
              to: customerEmail,
              orderNumber: orderId.slice(0, 8).toUpperCase(), // Short order ID
              customerName,
              items: emailItems,
              total,
              shipping: 0, // Livraison offerte ou extraire des line_items
              shippingAddress: {
                address: shippingDetails.line1 || "",
                addressComplement: shippingDetails.line2 || undefined,
                postalCode: shippingDetails.postal_code || "",
                city: shippingDetails.city || "",
                country: shippingDetails.country || "France",
              },
            });

            console.log("✅ Email de confirmation envoyé à:", customerEmail);
          } else {
            console.warn("⚠️ Could not send email - missing:", {
              email: !!customerEmail,
              shippingDetails: !!shippingDetails,
            });
          }

          // ============================================
          // ENVOI NOTIFICATION ADMIN
          // ============================================
          try {
            // Récupérer les paramètres pour vérifier si les notifications sont activées
            const settingsResult = await db
              .select()
              .from(settings)
              .where(eq(settings.id, "main-settings"))
              .limit(1);

            if (settingsResult.length > 0) {
              const siteSettings = settingsResult[0];
              const notificationsConfig =
                (siteSettings.notifications as Record<string, any>) ?? {};
              const emailTemplatesConfig =
                (siteSettings.emailTemplates as Record<string, any>) ?? {};

              // Vérifier si les notifications de nouvelles commandes sont activées
              const shouldNotify =
                notificationsConfig.newOrder === true &&
                emailTemplatesConfig.adminNotification !== false;

              if (shouldNotify && siteSettings.adminEmail) {
                console.log(
                  "📧 Envoi notification admin à:",
                  siteSettings.adminEmail,
                );

                const total = (session.amount_total ?? 0) / 100;
                await sendAdminNotificationEmail(
                  siteSettings.adminEmail,
                  orderId.slice(0, 8).toUpperCase(),
                  customerName,
                  total,
                );

                console.log("✅ Notification admin envoyée");
              } else {
                console.log(
                  "ℹ️ Notifications admin désactivées ou email non configuré",
                );
              }
            }
          } catch (adminEmailError) {
            // Ne pas bloquer le webhook si la notification admin échoue
            console.error(
              "❌ Failed to send admin notification:",
              adminEmailError,
            );
          }
        } catch (emailError) {
          // Ne pas bloquer le webhook si l'email échoue
          console.error("❌ Failed to send confirmation email:", emailError);
        }
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
