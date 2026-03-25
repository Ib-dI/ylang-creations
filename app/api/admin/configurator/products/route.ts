import { configuratorProduct } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";


// Public GET: List all products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const products = activeOnly
      ? await db.select().from(configuratorProduct).where(eq(configuratorProduct.isActive, true))
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

// Admin PUT: Update an existing product (active/inactive, description, etc)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
       return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const body = await request.json();
    console.log("Updating product with ID:", id, "payload:", body);
    const { id: _, updatedAt: __, createdAt: ___, ...updateData } = body;

    const result = await db.update(configuratorProduct)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(configuratorProduct.id, id));

    console.log("Update result:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating configurator product:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du produit" }, { status: 500 });
  }
}
