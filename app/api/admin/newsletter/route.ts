import { newsletterSubscriber } from "@/db/schema";
import { db } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth/with-admin-auth";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// force-dynamic: uses request.url — see app/api/products/route.ts for why
export const dynamic = "force-dynamic";

async function handleGET(request: Request): Promise<Response> {
  try {
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
export const GET = withAdminAuth(handleGET);
