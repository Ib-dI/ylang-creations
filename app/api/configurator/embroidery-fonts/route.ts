import { configuratorEmbroideryFont } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Public GET: List active embroidery fonts, ordered for display
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const fonts = activeOnly
      ? await db
          .select()
          .from(configuratorEmbroideryFont)
          .where(eq(configuratorEmbroideryFont.isActive, true))
          .orderBy(configuratorEmbroideryFont.order, configuratorEmbroideryFont.createdAt)
      : await db
          .select()
          .from(configuratorEmbroideryFont)
          .orderBy(configuratorEmbroideryFont.order, configuratorEmbroideryFont.createdAt);

    return NextResponse.json({ fonts });
  } catch (error) {
    console.error("Error fetching embroidery fonts:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des polices de broderie" },
      { status: 500 },
    );
  }
}
