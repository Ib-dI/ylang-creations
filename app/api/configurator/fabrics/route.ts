import { configuratorFabric } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Public GET: List active configurator fabrics
export async function GET(request: Request) {
  // request.url must be read outside the try/catch: Next throws an internal
  // signal here to bail out of prerendering, and our catch below would
  // otherwise swallow it. https://nextjs.org/docs/messages/ppr-caught-error
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") === "true";

  try {
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
