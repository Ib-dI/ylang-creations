import { db } from "@/lib/db";
import { product } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Force Node.js runtime for database connections
export const runtime = "nodejs";

// GET single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
        { status: 404 }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

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
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle numeric fields
    if (body.price !== undefined) {
      updateData.price = String(body.price);
    }
    if (body.compareAtPrice !== undefined) {
      updateData.compareAtPrice = body.compareAtPrice
        ? String(body.compareAtPrice)
        : null;
    }
    if (body.stock !== undefined) {
      updateData.stock = String(body.stock);
    }

    // Handle JSON fields
    if (body.images !== undefined) {
      updateData.images = body.images ? JSON.stringify(body.images) : null;
    }
    if (body.tags !== undefined) {
      updateData.tags = body.tags ? JSON.stringify(body.tags) : null;
    }
    if (body.options !== undefined) {
      updateData.options = body.options ? JSON.stringify(body.options) : null;
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    await db.delete(product).where(eq(product.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
