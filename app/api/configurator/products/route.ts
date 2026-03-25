import { configuratorProduct } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Public GET: List active configurator products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const products = activeOnly
      ? await db
          .select()
          .from(configuratorProduct)
          .where(eq(configuratorProduct.isActive, true))
      : await db.select().from(configuratorProduct);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching configurator products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits du configurateur" },
      { status: 500 }
    );
  }
}
