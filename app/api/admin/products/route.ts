import { product } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Force Node.js runtime for database connections
export const runtime = "nodejs";

// GET all products
export async function GET(request: Request) {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user) {
      console.error("❌ Utilisateur non authentifié pour GET /api/admin/products");
      console.error("Headers:", {
        cookie: requestHeaders.get("cookie") ? "present" : "missing",
        authorization: requestHeaders.get("authorization") ? "present" : "missing",
      });
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user) {
      console.error("❌ Utilisateur non authentifié pour POST /api/admin/products");
      console.error("Headers:", {
        cookie: requestHeaders.get("cookie") ? "present" : "missing",
        authorization: requestHeaders.get("authorization") ? "present" : "missing",
      });
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
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
    } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Nom, prix et catégorie requis" },
        { status: 400 },
      );
    }

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
      price: String(price),
      compareAtPrice: compareAtPrice ? String(compareAtPrice) : null,
      category,
      subcategory: subcategory || null,
      images: images ? JSON.stringify(images) : null,
      stock: String(stock || 0),
      sku: sku || null,
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      tags: tags ? JSON.stringify(tags) : null,
      options: options ? JSON.stringify(options) : null,
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
