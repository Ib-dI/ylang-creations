import { configuratorProduct } from "@/db/schema";
import { db } from "@/lib/db";
import { withAdminAuth } from "@/lib/auth/with-admin-auth";
import { normalizeEmbroideryZoneByFont } from "@/lib/configurator/normalize-embroidery-zone";
import {
  createConfiguratorProductSchema,
  updateConfiguratorProductSchema,
  validateRequest,
  formatZodErrors,
} from "@/lib/validations";
import { supabaseAdmin } from "@/utils/supabase/server";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const rows = activeOnly
      ? await db.select().from(configuratorProduct).where(eq(configuratorProduct.isActive, true))
      : await db.select().from(configuratorProduct);

    const products = rows.map((p) => ({
      ...p,
      embroideryZone: normalizeEmbroideryZoneByFont(p.embroideryZone),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching configurator products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits du configurateur" },
      { status: 500 }
    );
  }
}

async function handlePOST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validation = validateRequest(createConfiguratorProductSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.errors) }, { status: 400 });
    }

    const data = validation.data;
    const newProduct = await db.insert(configuratorProduct).values({
      id: data.id,
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      weight: data.weight,
      icon: data.icon ?? null,
      baseImage: data.baseImage,
      maskImage: data.maskImage,
      colorMaskImage: data.colorMaskImage ?? null,
      embroideryZone: data.embroideryZone,
      sizes: data.sizes ?? null,
      defaultSize: data.defaultSize ?? null,
      isActive: data.isActive,
    }).returning();

    revalidateTag("configurator", "max");

    return NextResponse.json({ product: newProduct[0] });
  } catch (error) {
    console.error("Error creating configurator product:", error);
    return NextResponse.json({ error: "Erreur lors de la création du produit" }, { status: 500 });
  }
}
export const POST = withAdminAuth(handlePOST);

async function handlePUT(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const body = await request.json();
    const validation = validateRequest(updateConfiguratorProductSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: formatZodErrors(validation.errors) }, { status: 400 });
    }

    await db.update(configuratorProduct)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(configuratorProduct.id, id));

    revalidateTag("configurator", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating configurator product:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du produit" }, { status: 500 });
  }
}
export const PUT = withAdminAuth(handlePUT);

async function handleDELETE(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const productRecord = await db.select().from(configuratorProduct).where(eq(configuratorProduct.id, id)).limit(1);

    if (productRecord.length > 0) {
      const p = productRecord[0];
      const imageUrls = [p.baseImage, p.maskImage, p.colorMaskImage].filter(Boolean) as string[];

      if (supabaseAdmin) {
        for (const imageUrl of imageUrls) {
          if (imageUrl.includes("/products/")) {
            const parts = imageUrl.split("/products/");
            if (parts.length > 1) {
              const { error } = await supabaseAdmin.storage.from("products").remove([parts[1]]);
              if (error) console.error("Erreur suppression image storage:", error.message);
            }
          }
        }
      }
    }

    await db.delete(configuratorProduct).where(eq(configuratorProduct.id, id));

    revalidateTag("configurator", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting configurator product:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du produit" }, { status: 500 });
  }
}
export const DELETE = withAdminAuth(handleDELETE);
