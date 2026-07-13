import { newsletterSubscriber } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // request.url must be read outside the try/catch: Next throws an internal
  // signal here to bail out of prerendering, and our catch below would
  // otherwise swallow it. https://nextjs.org/docs/messages/ppr-caught-error
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Token invalide" }, { status: 400 });
  }

  try {
    const existing = await db
      .select()
      .from(newsletterSubscriber)
      .where(eq(newsletterSubscriber.unsubscribeToken, token))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Token non trouvé" }, { status: 404 });
    }

    await db
      .update(newsletterSubscriber)
      .set({ status: "unsubscribed", updatedAt: new Date() })
      .where(eq(newsletterSubscriber.unsubscribeToken, token));

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?unsubscribed=1`,
    );
  } catch (error) {
    console.error("Erreur désinscription newsletter:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désinscription" },
      { status: 500 },
    );
  }
}
