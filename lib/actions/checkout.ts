"use server";

import {
  account,
  customer,
  order,
  session,
  settings,
  user as userTable,
} from "@/db/schema";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

const UCP_METADATA = {
  version: "2026-01-11",
  capabilities: [
    "dev.ucp.shopping.checkout",
    "dev.ucp.shopping.fulfillment",
    "dev.ucp.shopping.discount",
    "dev.ucp.shopping.order",
  ],
};

// Types
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  configuration?: any;
}

interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
  ucp?: typeof UCP_METADATA;
}

/**
 * Gets or creates a Stripe customer
 */
async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string,
): Promise<{ stripeCustomerId: string; customerId: string }> {
  // Ensure user exists in our local database (mirrored from Supabase)
  const existingUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  if (existingUser.length === 0) {
    // Check if user exists with same email but different ID (e.g. from a previous signup or seeded data)
    const existingUserByEmail = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    const now = new Date();

    if (existingUserByEmail.length > 0) {
      console.log(
        `Found existing user with email ${email} but different ID. Migrating data...`,
      );
      const oldUserId = existingUserByEmail[0].id;
      const tempEmail = `temp_${Date.now()}_${email}`;

      // 1. Create new user with temp email to avoid unique constraint
      await db.insert(userTable).values({
        id: userId,
        name: name,
        email: tempEmail,
        emailVerified: existingUserByEmail[0].emailVerified,
        image: existingUserByEmail[0].image,
        createdAt: existingUserByEmail[0].createdAt,
        updatedAt: now,
      });

      // 2. Migrate related records
      // Migrate customer
      await db
        .update(customer)
        .set({ userId: userId })
        .where(eq(customer.userId, oldUserId));

      // Migrate accounts (OAuth)
      await db
        .update(account)
        .set({ userId: userId })
        .where(eq(account.userId, oldUserId));

      // Migrate sessions
      await db
        .update(session)
        .set({ userId: userId })
        .where(eq(session.userId, oldUserId));

      // 3. Delete old user
      await db.delete(userTable).where(eq(userTable.id, oldUserId));

      // 4. Restore real email on new user
      await db
        .update(userTable)
        .set({ email: email })
        .where(eq(userTable.id, userId));

      console.log("User migration complete.");
    } else {
      // Normal creation
      await db.insert(userTable).values({
        id: userId,
        name: name,
        email: email,
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

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

    // 3. Get shipping settings
    const settingsResult = await db
      .select()
      .from(settings)
      .where(eq(settings.id, "main-settings"))
      .limit(1);

    const s = settingsResult[0];
    const shippingFeeValue = (s?.shippingFee ?? 990) / 100;
    const freeShippingThresholdValue =
      (s?.freeShippingThreshold ?? 15000) / 100;

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const isFreeShipping = subtotal >= freeShippingThresholdValue;

    // 4. Create Stripe line items
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

    // 5. Setup shipping options
    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
      [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: isFreeShipping ? 0 : Math.round(shippingFeeValue * 100),
              currency: "eur",
            },
            display_name: isFreeShipping
              ? "Livraison Gratuite"
              : "Livraison Standard",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
      ];

    // 4. Get or create Stripe customer
    const { stripeCustomerId, customerId } = await getOrCreateStripeCustomer(
      user.id,
      user.email!,
      user.user_metadata.full_name || user.email!,
    );

    // 5. Create pending order in database before Stripe redirect
    // This avoids Stripe's 500-character metadata limit for large carts
    const orderId = crypto.randomUUID();
    const now = new Date();

    await db.insert(order).values({
      id: orderId,
      customerId: customerId,
      status: "pending",
      totalAmount: Math.round(
        (subtotal + (isFreeShipping ? 0 : shippingFeeValue)) * 100,
      ),
      currency: "eur",
      items: JSON.stringify(items),
      createdAt: now,
      updatedAt: now,
    });

    // 6. Prepare metadata for Stripe (minimal IDs only)
    const metadata = {
      userId: user.id,
      userEmail: user.email!,
      customerId,
      orderId, // This allows the webhook to reconcile with ease
    };

    // 7. Create Stripe Checkout Session
    const headersList = await headers();
    const origin = headersList.get("origin");
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      origin ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer: stripeCustomerId,
      shipping_address_collection: {
        allowed_countries: [
          "FR",
          "BE",
          "CH",
          "LU",
          "MC",
          "DE",
          "IT",
          "ES",
          "PT",
          "NL",
          "GB",
          "US",
          "CA",
        ],
      },
      shipping_options: shippingOptions,
      metadata,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    });

    // 8. Update order with Stripe Session ID
    await db
      .update(order)
      .set({ stripeSessionId: checkoutSession.id, updatedAt: new Date() })
      .where(eq(order.id, orderId));

    return {
      success: true,
      url: checkoutSession.url ?? undefined,
      ucp: UCP_METADATA,
    };
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
