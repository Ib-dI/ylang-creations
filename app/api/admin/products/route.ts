import { product } from "@/db/schema";
import { db } from "@/lib/db";
import { cents, centsToEuros, euros, eurosToCents } from "@/lib/currency";
import { createProductSchema, formatZodErrors } from "@/lib/validations";
import { withAdminAuth } from "@/lib/auth/with-admin-auth";
import { desc } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// force-dynamic: uses request.url — see app/api/products/route.ts for why
export const dynamic = "force-dynamic";

// GET all products
async function handleGET(request: Request): Promise<Response> {
  try {
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
      price: centsToEuros(cents(p.price)),
      compareAtPrice: p.compareAtPrice ? centsToEuros(cents(p.compareAtPrice)) : null,
      category: p.category,
      subcategory: p.subcategory,
      images: (p.images as string[] | null) ?? [],
      stock: p.stock,
      weight: p.weight,
      sku: p.sku,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      tags: (p.tags as string[] | null) ?? [],
      options: (p.options as Record<string, unknown> | null) ?? {},
      sizes: (p.sizes as string[] | null) ?? [],
      defaultSize: p.defaultSize ?? null,
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
export const GET = withAdminAuth(handleGET);

// POST create new product
async function handlePOST(request: Request): Promise<Response> {
  try {
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
      sizes,
      defaultSize,
      weight,
    } = validation.data;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(product).values({
      id,
      name,
      slug: `${slug}-${id.slice(0, 8)}`,
      description: description || null,
      price: eurosToCents(euros(price)),
      compareAtPrice: compareAtPrice ? eurosToCents(euros(compareAtPrice)) : null,
      category,
      subcategory: subcategory || null,
      images: images ?? null,
      stock: stock || 0,
      weight: weight ?? 0,
      sku: sku || null,
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      tags: tags ?? null,
      options: options ?? null,
      sizes: sizes ?? null,
      defaultSize: defaultSize ?? null,
      createdAt: now,
      updatedAt: now,
    });

    revalidateTag("products", "max");

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 },
    );
  }
}
export const POST = withAdminAuth(handlePOST);
