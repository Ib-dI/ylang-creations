import { configuratorColor } from "@/db/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET: List active colors, optionally filtered by type
export async function GET(request: Request) {
  // request.url must be read outside the try/catch: Next throws an internal
  // signal here to bail out of prerendering, and our catch below would
  // otherwise swallow it. https://nextjs.org/docs/messages/ppr-caught-error
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "product" | "embroidery"

  try {
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
