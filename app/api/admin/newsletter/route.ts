import { newsletterSubscriber } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let subscribers = await db
      .select()
      .from(newsletterSubscriber)
      .orderBy(desc(newsletterSubscriber.createdAt));

    if (status && (status === "active" || status === "unsubscribed")) {
      subscribers = subscribers.filter((s) => s.status === status);
    }

    const total = subscribers.length;
    const activeCount = subscribers.filter((s) => s.status === "active").length;

    return NextResponse.json({ subscribers, total, activeCount });
  } catch (error) {
    console.error("Erreur récupération abonnés newsletter:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des abonnés" },
      { status: 500 },
    );
  }
}
