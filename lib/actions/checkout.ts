"use server";

import { customer } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

// Types
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Gets or creates a Stripe customer
 */
async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string,
): Promise<{ stripeCustomerId: string; customerId: string }> {
  // Check if customer exists in our database
  const existingCustomer = await db
    .select()
    .from(customer)
    .where(eq(customer.userId, userId))
    .limit(1);

  if (existingCustomer.length > 0 && existingCustomer[0].stripeCustomerId) {
    return {
      stripeCustomerId: existingCustomer[0].stripeCustomerId,
      customerId: existingCustomer[0].id,
    };
  }

  // Check if customer exists in Stripe by email
  const existingStripeCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  let stripeCustomerId: string;

  if (existingStripeCustomers.data.length > 0) {
    stripeCustomerId = existingStripeCustomers.data[0].id;
  } else {
    // Create new Stripe customer
    const newStripeCustomer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });
    stripeCustomerId = newStripeCustomer.id;
  }

  // Create or update customer in database
  const customerId = crypto.randomUUID();
  const now = new Date();

  if (existingCustomer.length > 0) {
    await db
      .update(customer)
      .set({ stripeCustomerId, name, updatedAt: now })
      .where(eq(customer.userId, userId));
    return {
      stripeCustomerId,
      customerId: existingCustomer[0].id,
    };
  }

  await db.insert(customer).values({
    id: customerId,
    userId,
    email,
    name,
    stripeCustomerId,
    createdAt: now,
    updatedAt: now,
  });

  return {
    stripeCustomerId,
    customerId,
  };
}

/**
 * Creates a Stripe Checkout Session from cart items
 */
export async function createCheckoutSession(
  items: CartItem[],
): Promise<CheckoutResult> {
  try {
    // 1. Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Veuillez vous connecter pour commander",
      };
    }

    // 2. Validate cart is not empty
    if (!items || items.length === 0) {
      return { success: false, error: "Votre panier est vide" };
    }

    // 3. Create Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            metadata: {
              productId: item.productId,
            },
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }),
    );

    // 4. Get or create Stripe customer
    const { stripeCustomerId, customerId } = await getOrCreateStripeCustomer(
      user.id,
      user.email!,
      user.user_metadata.full_name || user.email!,
    );

    // 5. Prepare metadata for webhook
    const metadata = {
      userId: user.id,
      userEmail: user.email!,
      customerId,
      items: JSON.stringify(items),
    };

    // 6. Create Stripe Checkout Session
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer: stripeCustomerId,
      shipping_address_collection: {
        allowed_countries: [
          "FR", // France
          "BE", // Belgium
          "CH", // Switzerland
          "LU", // Luxembourg
          "MC", // Monaco
          "DE", // Germany
          "IT", // Italy
          "ES", // Spain
          "PT", // Portugal
          "NL", // Netherlands
          "GB", // United Kingdom
          "US", // United States
          "CA", // Canada
        ],
      },
      metadata,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    });

    return { success: true, url: checkoutSession.url ?? undefined };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      success: false,
      error: "Une erreur est survenue. Veuillez réessayer.",
    };
  }
}

/**
 * Retrieves a checkout session by ID (for success page)
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Non authentifié" };
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer_details"],
    });

    // Verify the session belongs to this user
    if (checkoutSession.metadata?.userId !== user.id) {
      return { success: false, error: "Session non trouvée" };
    }

    return {
      success: true,
      session: {
        id: checkoutSession.id,
        customerEmail: checkoutSession.customer_details?.email,
        customerName: checkoutSession.customer_details?.name,
        amountTotal: checkoutSession.amount_total,
        paymentStatus: checkoutSession.payment_status,
        shippingAddress: checkoutSession.customer_details?.address,
        lineItems: checkoutSession.line_items?.data.map((item) => ({
          name: item.description,
          quantity: item.quantity,
          amount: item.amount_total,
        })),
      },
    };
  } catch (error) {
    console.error("Get session error:", error);
    return { success: false, error: "Impossible de récupérer les détails" };
  }
}
