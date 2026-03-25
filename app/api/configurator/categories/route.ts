import { configuratorFabricCategory } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    let query = db.select().from(configuratorFabricCategory);

    if (activeOnly) {
      query = query.where(eq(configuratorFabricCategory.isActive, true));
    }

    const categories = await query.orderBy(configuratorFabricCategory.order);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching configurator categories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories de tissus" },
      { status: 500 }
    );
  }
}
