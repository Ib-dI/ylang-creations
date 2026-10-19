import { newsletterSubscriber } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

// Webhook Brevo (transactionnel) : Brevo ajoute son propre en-tête
// List-Unsubscribe à chaque email. Quand un destinataire l'utilise (ou signale
// un spam), on répercute la désinscription dans notre base newsletter.
// URL à configurer dans Brevo : /api/webhooks/brevo?token=<BREVO_WEBHOOK_SECRET>

const UNSUBSCRIBE_EVENTS = new Set(["unsubscribed", "spam"]);

interface BrevoWebhookEvent {
  event?: string;
  email?: string;
}

function isValidToken(token: string | null): boolean {
  const secret = process.env.BREVO_WEBHOOK_SECRET;
  if (!secret || !token) return false;

  const expected = Buffer.from(secret);
  const received = Buffer.from(token);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  if (!isValidToken(searchParams.get("token"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    // Brevo envoie un objet, ou un tableau en mode "batched"
    const events = (Array.isArray(body) ? body : [body]) as BrevoWebhookEvent[];

    const emails = events
      .filter((e) => e.event && UNSUBSCRIBE_EVENTS.has(e.event) && e.email)
      .map((e) => e.email!.toLowerCase());

    if (emails.length > 0) {
      await db
        .update(newsletterSubscriber)
        .set({ status: "unsubscribed", updatedAt: new Date() })
        .where(
          and(
            inArray(newsletterSubscriber.email, emails),
            eq(newsletterSubscriber.status, "active"),
          ),
        );
      console.log(`[Brevo Webhook] ${emails.length} désinscription(s) synchronisée(s)`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[Brevo Webhook] Erreur:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
