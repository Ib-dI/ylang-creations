import { settings } from "@/db/schema";
import { db } from "@/lib/db";
import { formatZodErrors, settingsSchema } from "@/lib/validations";
import { createClient } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
        adminEmail: "ylang.creations@gmail.com",
        emailTemplates: {
          orderConfirmation: true,
          shippingNotification: true,
          adminNotification: true,
        },
        currency: "eur",
        shippingFee: "9.90",
        freeShippingThreshold: "150",
        notifications: {
          newOrder: true,
          lowStock: true,
          newCustomer: false,
          dailySummary: false,
        },
        heroSlides: [],
        craftsmanshipImage: "",
        aboutImage: "",
        testimonials: [],
      });
    }

    const s = result[0];
    return NextResponse.json({
      ...s,
      emailTemplates: s.emailTemplates ? JSON.parse(s.emailTemplates) : {},
      notifications: s.notifications ? JSON.parse(s.notifications) : {},
      heroSlides: s.heroSlides ? JSON.parse(s.heroSlides) : [],
      testimonials: s.testimonials ? JSON.parse(s.testimonials) : [],
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification authentification ET rôle admin
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();

    // Validation avec Zod
    const validation = settingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: formatZodErrors(validation.error) },
        { status: 400 },
      );
    }

    const {
      storeName,
      storeDescription,
      contactEmail,
      contactPhone,
      shippingEmail,
      adminEmail,
      emailTemplates,
      currency,
      shippingFee,
      freeShippingThreshold,
      notifications,
      heroSlides,
      craftsmanshipImage,
      aboutImage,
      testimonials,
    } = validation.data;

    const now = new Date();

    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.id, SETTINGS_ID))
      .limit(1);

    const values = {
      storeName,
      storeDescription,
      contactEmail,
      contactPhone,
      shippingEmail,
      adminEmail,
      emailTemplates: JSON.stringify(emailTemplates),
      currency,
      shippingFee: String(shippingFee),
      freeShippingThreshold: String(freeShippingThreshold),
      notifications: JSON.stringify(notifications),
      heroSlides: JSON.stringify(heroSlides),
      craftsmanshipImage,
      aboutImage,
      testimonials: JSON.stringify(testimonials),
      updatedAt: now,
    };

    if (result.length === 0) {
      await db.insert(settings).values({
        id: SETTINGS_ID,
        ...values,
      });
    } else {
      await db.update(settings).set(values).where(eq(settings.id, SETTINGS_ID));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde des paramètres" },
      { status: 500 },
    );
  }
}
