import { configuratorFabricCategory } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // request.url must be read outside the try/catch: Next throws an internal
  // signal here to bail out of prerendering, and our catch below would
  // otherwise swallow it. https://nextjs.org/docs/messages/ppr-caught-error
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") === "true";

  try {
    const categories = activeOnly
      ? await db.select().from(configuratorFabricCategory).where(eq(configuratorFabricCategory.isActive, true)).orderBy(configuratorFabricCategory.order)
      : await db.select().from(configuratorFabricCategory).orderBy(configuratorFabricCategory.order);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching configurator categories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories de tissus" },
      { status: 500 }
    );
  }
}
