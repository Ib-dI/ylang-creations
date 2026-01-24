import { product, review } from "@/db/schema";
import { db } from "@/lib/db";
import { formatZodErrors, updateProductSchema } from "@/lib/validations";
import { createClient, supabaseAdmin } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Force Node.js runtime for database connections
export const runtime = "nodejs";

// GET single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification authentification ET rôle admin
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    const products = await db
      .select()
      .from(product)
      .where(eq(product.id, id))
      .limit(1);

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 },
      );
    }

    const p = products[0];

    return NextResponse.json({
      product: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: parseFloat(p.price),
        compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        category: p.category,
        subcategory: p.subcategory,
        images: p.images ? JSON.parse(p.images) : [],
        stock: parseInt(p.stock),
        sku: p.sku,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        tags: p.tags ? JSON.parse(p.tags) : [],
        options: p.options ? JSON.parse(p.options) : {},
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH update product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification authentification ET rôle admin
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validation avec Zod
    const validation = updateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: formatZodErrors(validation.error) },
        { status: 400 },
      );
    }

    const validatedData = validation.data;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Map fields that can be updated
    const allowedFields = [
      "name",
      "description",
      "category",
      "subcategory",
      "sku",
      "isActive",
      "isFeatured",
    ] as const;

    for (const field of allowedFields) {
      if (validatedData[field] !== undefined) {
        updateData[field] = validatedData[field];
      }
    }

    // Handle numeric fields
    if (validatedData.price !== undefined) {
      updateData.price = String(validatedData.price);
    }
    if (validatedData.compareAtPrice !== undefined) {
      updateData.compareAtPrice = validatedData.compareAtPrice
        ? String(validatedData.compareAtPrice)
        : null;
    }
    if (validatedData.stock !== undefined) {
      updateData.stock = String(validatedData.stock);
    }

    // Handle JSON fields
    if (validatedData.images !== undefined) {
      updateData.images = validatedData.images
        ? JSON.stringify(validatedData.images)
        : null;
    }
    if (validatedData.tags !== undefined) {
      updateData.tags = validatedData.tags
        ? JSON.stringify(validatedData.tags)
        : null;
    }
    if (validatedData.options !== undefined) {
      updateData.options = validatedData.options
        ? JSON.stringify(validatedData.options)
        : null;
    }

    await db.update(product).set(updateData).where(eq(product.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification authentification ET rôle admin
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    // 1. Récupérer le produit pour avoir la liste des images
    const products = await db
      .select({ images: product.images })
      .from(product)
      .where(eq(product.id, id))
      .limit(1);

    if (products.length > 0) {
      const p = products[0];
      let images: string[] = [];

      try {
        images = p.images ? JSON.parse(p.images) : [];
      } catch (e) {
        console.error("Error parsing images JSON:", e);
      }

      // 2. Supprimer les images du stockage Supabase
      if (images.length > 0 && supabaseAdmin) {
        const pathsToDelete: string[] = [];

        for (const imageUrl of images) {
          try {
            // Extraire le chemin relatif de l'URL
            // Format typique: .../storage/v1/object/public/products/folder/file.jpg
            if (imageUrl.includes("/products/")) {
              const parts = imageUrl.split("/products/");
              if (parts.length > 1) {
                // Le chemin est tout ce qui est après "/products/"
                pathsToDelete.push(parts[1]);
              }
            }
          } catch (e) {
            console.error("Error parsing image URL:", imageUrl, e);
          }
        }

        if (pathsToDelete.length > 0) {
          console.log("Deleting images from storage:", pathsToDelete);
          const { error: storageError } = await supabaseAdmin.storage
            .from("products")
            .remove(pathsToDelete);

          if (storageError) {
            console.error(
              "Error deleting images from storage:",
              storageError.message,
            );
            // On continue quand même la suppression du produit
          } else {
            console.log("Images deleted successfully");
          }
        }
      }
    }

    // 3. Supprimer les avis associés au produit (FK Constraint)
    await db.delete(review).where(eq(review.productId, id));

    // 4. Supprimer le produit
    await db.delete(product).where(eq(product.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
