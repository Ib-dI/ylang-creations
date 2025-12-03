import {
  sendAdminNotificationEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email/send-order-confirmation";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Gérer les événements
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      console.log("✅ Paiement réussi:", paymentIntent.id);

      // Récupérer les données de la commande depuis les métadonnées
      const metadata = paymentIntent.metadata;
      const orderDetails = JSON.parse(metadata.orderDetails || "{}");

      // Générer le numéro de commande
      const orderNumber = `YC${Date.now().toString().slice(-8)}`;

      // Envoyer l'email de confirmation au client
      await sendOrderConfirmationEmail({
        to: metadata.customerEmail,
        orderNumber,
        customerName:
          orderDetails.customer.firstName +
          " " +
          orderDetails.customer.lastName,
        items: orderDetails.items,
        total: paymentIntent.amount / 100,
        shipping: 0, // À calculer selon votre logique
        shippingAddress: {
          address: orderDetails.customer.address,
          addressComplement: orderDetails.customer.addressComplement,
          postalCode: orderDetails.customer.postalCode,
          city: orderDetails.customer.city,
          country: orderDetails.customer.country,
        },
      });

      // Envoyer notification à l'admin
      await sendAdminNotificationEmail(
        orderNumber,
        orderDetails.customer.firstName + " " + orderDetails.customer.lastName,
        paymentIntent.amount / 100,
      );

      break;

    case "payment_intent.payment_failed":
      console.log("❌ Paiement échoué");
      break;

    default:
      console.log(`ℹ️ Événement non géré: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
