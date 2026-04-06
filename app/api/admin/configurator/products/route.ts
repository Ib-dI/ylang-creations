import { configuratorProduct } from "@/db/schema";
import { db } from "@/lib/db";
import { createClient, supabaseAdmin } from "@/utils/supabase/server";
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

// Admin POST: Create a new configurator product
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.id || !body.name || !body.baseImage || !body.maskImage) {
      return NextResponse.json({ error: "Données manquantes (id, name, baseImage, maskImage requis)" }, { status: 400 });
    }

    const newProduct = await db.insert(configuratorProduct).values({
      id: body.id,
      name: body.name,
      description: body.description || "",
      basePrice: body.basePrice ?? 0,
      weight: body.weight ?? 0,
      icon: body.icon || null,
      baseImage: body.baseImage,
      maskImage: body.maskImage,
      colorMaskImage: body.colorMaskImage || null,
      embroideryZone: body.embroideryZone ?? { x: 0.5, y: 0.3, maxWidth: 0.5, rotation: 0, fontSize: 28, alignment: "center" },
      sizes: body.sizes ?? null,
      defaultSize: body.defaultSize ?? null,
      isActive: body.isActive ?? true,
    }).returning();

    return NextResponse.json({ product: newProduct[0] });
  } catch (error) {
    console.error("Error creating configurator product:", error);
    return NextResponse.json({ error: "Erreur lors de la création du produit" }, { status: 500 });
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

// Admin DELETE: Remove a configurator product and clean up Supabase Storage
export async function DELETE(request: Request) {
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

    // 1. Fetch product to get image URLs
    const productRecord = await db.select().from(configuratorProduct).where(eq(configuratorProduct.id, id)).limit(1);

    if (productRecord.length > 0) {
      const product = productRecord[0];
      const imageUrls = [product.baseImage, product.maskImage, product.colorMaskImage].filter(Boolean) as string[];

      // 2. Supprimer les images du stockage Supabase (bucket "products")
      if (supabaseAdmin) {
        for (const imageUrl of imageUrls) {
          if (imageUrl && imageUrl.includes("/products/")) {
            const parts = imageUrl.split("/products/");
            if (parts.length > 1) {
              const relativePath = parts[1];
              const { error } = await supabaseAdmin.storage.from("products").remove([relativePath]);
              if (error) {
                console.error("Erreur lors de la suppression de l'image du storage:", error.message);
              } else {
                console.log("Image du produit supprimée:", relativePath);
              }
            }
          }
        }
      }
    }

    // 3. Supprimer le produit de la DB
    await db.delete(configuratorProduct).where(eq(configuratorProduct.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting configurator product:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du produit" }, { status: 500 });
  }
}
