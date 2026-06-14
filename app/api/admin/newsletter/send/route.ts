import { newsletterSubscriber } from "@/db/schema";
import { db } from "@/lib/db";
import { sendNewsletterCampaign } from "@/lib/email/send-newsletter-campaign";
import {
  formatZodErrors,
  newsletterCampaignSchema,
  validateRequest,
} from "@/lib/validations";
import { withAdminAuth } from "@/lib/auth/with-admin-auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

async function handlePOST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validation = validateRequest(newsletterCampaignSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: formatZodErrors(validation.errors) },
        { status: 400 },
      );
    }

    const { subject, htmlContent } = validation.data;

    // Récupérer tous les abonnés actifs
    const subscribers = await db
      .select({ email: newsletterSubscriber.email, unsubscribeToken: newsletterSubscriber.unsubscribeToken })
      .from(newsletterSubscriber)
      .where(eq(newsletterSubscriber.status, "active"));

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "Aucun abonné actif à contacter." },
        { status: 400 },
      );
    }

    const { sent, failed } = await sendNewsletterCampaign({
      subject,
      htmlContent,
      subscribers,
    });

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error("Erreur envoi campagne newsletter:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la campagne" },
      { status: 500 },
    );
  }
}
export const POST = withAdminAuth(handlePOST);
