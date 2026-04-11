import { newsletterSubscriber } from "@/db/schema";
import { db } from "@/lib/db";
import { sendNewsletterWelcomeEmail } from "@/lib/email/send-newsletter-welcome";
import {
  formatZodErrors,
  newsletterSubscribeSchema,
  validateRequest,
} from "@/lib/validations";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateRequest(newsletterSubscribeSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: formatZodErrors(validation.errors) },
        { status: 400 },
      );
    }

    const { email } = validation.data;

    // Vérifier si l'email existe déjà
    const existing = await db
      .select()
      .from(newsletterSubscriber)
      .where(eq(newsletterSubscriber.email, email))
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].status === "active") {
        return NextResponse.json(
          { error: "Cette adresse email est déjà inscrite à la newsletter." },
          { status: 409 },
        );
      }

      // Réinscription : réactiver silencieusement
      await db
        .update(newsletterSubscriber)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(newsletterSubscriber.email, email));

      sendNewsletterWelcomeEmail({
        to: email,
        unsubscribeToken: existing[0].unsubscribeToken,
      }).catch(console.error);

      return NextResponse.json({ success: true });
    }

    // Nouvel abonné
    const id = crypto.randomUUID();
    const unsubscribeToken = crypto.randomUUID();

    await db.insert(newsletterSubscriber).values({
      id,
      email,
      status: "active",
      unsubscribeToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Fire-and-forget : un échec email ne bloque pas l'inscription
    sendNewsletterWelcomeEmail({ to: email, unsubscribeToken }).catch(
      console.error,
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Erreur inscription newsletter:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 },
    );
  }
}
