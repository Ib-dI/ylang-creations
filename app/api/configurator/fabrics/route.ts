import { configuratorFabric } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Public GET: List active configurator fabrics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const fabrics = activeOnly
      ? await db
          .select()
          .from(configuratorFabric)
          .where(eq(configuratorFabric.isActive, true))
      : await db.select().from(configuratorFabric);

    return NextResponse.json({ fabrics });
  } catch (error) {
    console.error("Error fetching configurator fabrics:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des tissus" },
      { status: 500 }
    );
  }
}
