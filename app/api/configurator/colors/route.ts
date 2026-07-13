import { configuratorColor } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// force-dynamic: uses request.url — see app/api/products/route.ts for why
export const dynamic = "force-dynamic";

// GET: List active colors, optionally filtered by type
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "product" | "embroidery"

    const colors = type
      ? await db.select().from(configuratorColor)
          .where(and(eq(configuratorColor.isActive, true), eq(configuratorColor.type, type)))
          .orderBy(configuratorColor.order, configuratorColor.createdAt)
      : await db.select().from(configuratorColor)
          .where(eq(configuratorColor.isActive, true))
          .orderBy(configuratorColor.order, configuratorColor.createdAt);

    return NextResponse.json({ colors });
  } catch (error) {
    console.error("Error fetching colors:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des couleurs" }, { status: 500 });
  }
}
