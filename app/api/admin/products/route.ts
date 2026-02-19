import { product } from "@/db/schema";
import { db } from "@/lib/db";
import { createProductSchema, formatZodErrors } from "@/lib/validations";
import { createClient } from "@/utils/supabase/server";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// Force Node.js runtime for database connections
export const runtime = "nodejs";

// GET all products
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification authentification ET rôle admin
    if (!user || user.app_metadata?.role !== "admin") {
      console.error("❌ Accès non autorisé pour GET /api/admin/products");
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const active = searchParams.get("active");

    let query = db.select().from(product).orderBy(desc(product.createdAt));

    const products = await query;

    // Format products
    let formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price / 100,
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice / 100 : null,
      category: p.category,
      subcategory: p.subcategory,
      images: (p.images as string[] | null) ?? [],
      stock: p.stock,
      sku: p.sku,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      tags: (p.tags as string[] | null) ?? [],
      options: (p.options as Record<string, unknown> | null) ?? {},
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    // Apply filters
    if (category) {
      formattedProducts = formattedProducts.filter(
        (p) => p.category === category,
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      formattedProducts = formattedProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.sku?.toLowerCase().includes(searchLower),
      );
    }

    if (active === "true") {
      formattedProducts = formattedProducts.filter((p) => p.isActive);
    } else if (active === "false") {
      formattedProducts = formattedProducts.filter((p) => !p.isActive);
    }

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 },
    );
  }
}

// POST create new product
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Vérification authentification ET rôle admin
    if (!user || user.app_metadata?.role !== "admin") {
      console.error("❌ Accès non autorisé pour POST /api/admin/products");
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();

    // Validation avec Zod
    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: formatZodErrors(validation.error) },
        { status: 400 },
      );
    }

    const {
      name,
      description,
      price,
      compareAtPrice,
      category,
      subcategory,
      images,
      stock,
      sku,
      isActive,
      isFeatured,
      tags,
      options,
    } = validation.data;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(product).values({
      id,
      name,
      slug: `${slug}-${id.slice(0, 8)}`,
      description: description || null,
      price: Math.round(price * 100),
      compareAtPrice: compareAtPrice ? Math.round(compareAtPrice * 100) : null,
      category,
      subcategory: subcategory || null,
      images: images ?? null,
      stock: stock || 0,
      sku: sku || null,
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      tags: tags ?? null,
      options: options ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 },
    );
  }
}
