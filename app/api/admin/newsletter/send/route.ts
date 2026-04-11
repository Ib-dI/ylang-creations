import { newsletterSubscriber } from "@/db/schema";
import { db } from "@/lib/db";
import { sendNewsletterCampaign } from "@/lib/email/send-newsletter-campaign";
import {
  formatZodErrors,
  newsletterCampaignSchema,
  validateRequest,
} from "@/lib/validations";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

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
