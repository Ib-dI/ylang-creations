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
const sumupApiUrl = "https://api.sumup.com/v0.1";

if (!process.env.SUMUP_SECRET_KEY) {
  throw new Error("SUMUP_SECRET_KEY is not defined");
}

if (!process.env.SUMUP_MERCHANT_CODE) {
  throw new Error("SUMUP_MERCHANT_CODE is not defined");
}

const sumupHeaders = {
  Authorization: `Bearer ${process.env.SUMUP_SECRET_KEY}`,
  "Content-Type": "application/json",
};

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
  weight?: number;
  image?: string;
  configuration?: any;
}

/**
 * Calcule les frais de livraison Colissimo à domicile 2026
 * en fonction du poids total du colis (en grammes).
 */
function calculateColissimoHomeRate(weightGrams: number): number {
  if (weightGrams <= 250) return 5.49;
  if (weightGrams <= 500) return 7.59;
  if (weightGrams <= 750) return 9.29;
  if (weightGrams <= 1000) return 9.59;
  if (weightGrams <= 2000) return 11.19;
  if (weightGrams <= 5000) return 17.39;
  if (weightGrams <= 10000) return 25.29;
  return 39.59; // jusqu'à 30 kg
}

interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
  ucp?: typeof UCP_METADATA;
}

/**
 * Gets or creates a local customer reference
 */
async function getOrCreateLocalCustomer(
  userId: string,
  email: string,
  name: string,
): Promise<string> {
  // Ensure user exists in our local database (mirrored from Supabase)
  const existingUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  const now = new Date();

  if (existingUser.length === 0) {
    // Check if user exists with same email but different ID (e.g. from a previous signup or seeded data)
    const existingUserByEmail = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

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
      await db
        .update(customer)
        .set({ userId: userId })
        .where(eq(customer.userId, oldUserId));

      await db
        .update(account)
        .set({ userId: userId })
        .where(eq(account.userId, oldUserId));

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

  if (existingCustomer.length > 0) {
     return existingCustomer[0].id;
  }

  // Create new local customer
  const customerId = crypto.randomUUID();
  
  await db.insert(customer).values({
    id: customerId,
    userId,
    email,
    name,
    createdAt: now,
    updatedAt: now,
  });

  return customerId;
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
    const freeShippingThresholdValue =
      (s?.freeShippingThreshold ?? 15000) / 100;

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const isFreeShipping = subtotal >= freeShippingThresholdValue;

    // Calcul des frais par poids Colissimo 2026
    const totalWeight = items.reduce(
      (acc, item) => acc + (item.weight ?? 0) * item.quantity,
      0,
    );
    // Fallback sur la valeur DB si aucun poids défini
    const shippingFeeValue =
      totalWeight > 0
        ? calculateColissimoHomeRate(totalWeight)
        : (s?.shippingFee ?? 990) / 100;

    // 4. Get or create local customer
    const customerId = await getOrCreateLocalCustomer(
      user.id,
      user.email!,
      user.user_metadata?.full_name || user.email!,
    );

    // 5. Create pending order in database
    const orderId = crypto.randomUUID();
    const now = new Date();
    const totalAmount = subtotal + (isFreeShipping ? 0 : shippingFeeValue);

    await db.insert(order).values({
      id: orderId,
      customerId: customerId,
      status: "pending",
      totalAmount: Math.round(totalAmount * 100),
      currency: "eur",
      items: items,
      createdAt: now,
      updatedAt: now,
    });

    const headersList = await headers();
    const origin = headersList.get("origin");
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      origin ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";

    // 6. Create SumUp Checkout
    const sumupPayload = {
      merchant_code: process.env.SUMUP_MERCHANT_CODE,
      amount: totalAmount,
      currency: "EUR",
      checkout_reference: orderId, // Our internal order ID
      redirect_url: `${baseUrl}/checkout/success`,
      return_url: `${baseUrl}/api/webhooks/sumup`,
      description: `Commande sur Ylang Créations - ${items.length} article(s)`,
    };

    const sumupResponse = await fetch(`${sumupApiUrl}/checkouts`, {
      method: "POST",
      headers: sumupHeaders,
      body: JSON.stringify(sumupPayload),
    });

    if (!sumupResponse.ok) {
      const errorText = await sumupResponse.text();
      console.error("Failed to create SumUp checkout:", errorText);
      throw new Error("Failed to create checkout session");
    }

    const checkoutSession = await sumupResponse.json();

    // 7. Update order with SumUp Checkout ID
    await db
      .update(order)
      .set({ sumupCheckoutId: checkoutSession.id, updatedAt: new Date() })
      .where(eq(order.id, orderId));

    return {
      success: true,
      url: checkoutSession.id, // Return checkout ID instead of URL for the Card Widget
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

    const sumupResponse = await fetch(`${sumupApiUrl}/checkouts/${sessionId}`, {
      method: "GET",
      headers: sumupHeaders,
    });

    if (!sumupResponse.ok) {
      return { success: false, error: "Session non trouvée" };
    }

    const checkoutSession = await sumupResponse.json();

    // Verify the session belongs to this user (we verify against our local DB using the checkout reference)
    const orderDetails = await db
      .select({
        id: order.id,
        items: order.items,
        customerId: order.customerId,
      })
      .from(order)
      .where(eq(order.id, checkoutSession.checkout_reference))
      .limit(1);

    if (orderDetails.length === 0) {
      return { success: false, error: "Commande non trouvée" };
    }

    const parsedItems = (orderDetails[0].items as any[]) || [];

    return {
      success: true,
      session: {
        id: checkoutSession.id,
        customerEmail: user.email,
        customerName: user.user_metadata?.full_name || "Client",
        amountTotal: Math.round(checkoutSession.amount * 100), // convert to cents for frontend consistency
        paymentStatus: checkoutSession.status, // "PAID", "PENDING", "FAILED" etc.
        lineItems: parsedItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          amount: Math.round(item.price * item.quantity * 100),
        })),
      },
    };
  } catch (error) {
    console.error("Get session error:", error);
    return { success: false, error: "Impossible de récupérer les détails" };
  }
}
