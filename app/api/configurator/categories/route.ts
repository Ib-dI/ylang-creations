import { configuratorFabricCategory } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

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
