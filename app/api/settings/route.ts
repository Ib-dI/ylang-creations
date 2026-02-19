import { settings } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache 60 secondes max

const SETTINGS_ID = "main-settings";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.id, SETTINGS_ID))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({
        storeName: "Ylang Créations",
        storeDescription: "Créations artisanales pour bébés et enfants",
        contactEmail: "contact@ylang-creations.fr",
        contactPhone: "+33 1 23 45 67 89",
        shippingEmail: "commandes@ylang-creations.fr",
        currency: "eur",
        shippingFee: "9.90",
        freeShippingThreshold: "150",
        heroSlides: [],
        craftsmanshipImage: "",
        aboutImage: "",
        testimonials: [],
      });
    }

    const s = result[0];

    // On ne retourne que les données publiques nécessaires au front
    // On exclut les données sensibles comme adminEmail, notifications, emailTemplates...
    return NextResponse.json({
      storeName: s.storeName,
      storeDescription: s.storeDescription,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      shippingEmail: s.shippingEmail,
      currency: s.currency,
      shippingFee: s.shippingFee,
      freeShippingThreshold: s.freeShippingThreshold,
      heroSlides: s.heroSlides ?? [],
      craftsmanshipImage: s.craftsmanshipImage,
      aboutImage: s.aboutImage,
      testimonials: s.testimonials ?? [],
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 },
    );
  }
}
