import { product } from "@/db/schema";
import { db } from "@/lib/db";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// Force Node.js runtime for database connections
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limitParam = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limitParam;

    // Base query: Only active products for public view
    const conditions = [eq(product.isActive, true)];

    if (featured === "true") {
      conditions.push(eq(product.isFeatured, true));
    }

    if (category && category !== "Tout") {
      conditions.push(eq(product.category, category));
    }

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      const searchCondition = or(
        like(sql`lower(${product.name})`, searchLower),
        like(sql`lower(${product.description})`, searchLower),
        like(sql`lower(${product.category})`, searchLower),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    let orderBy = desc(product.createdAt);
    if (sort === "price-asc") {
      orderBy = asc(product.price);
    } else if (sort === "price-desc") {
      orderBy = desc(product.price);
    } else if (sort === "name") {
      orderBy = asc(product.name);
    }

    const query = db
      .select()
      .from(product)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limitParam)
      .offset(offset);

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(product)
      .where(and(...conditions));

    const total = Number(totalResult?.count || 0);

    const products = await query;

    // Format for frontend
    const formattedProducts = products.map((p) => {
      const parsedImages = (p.images as string[] | null) ?? [];

      interface ParsedOptions {
        sizes?: string[];
        customizable?: boolean;
        isNew?: boolean;
      }

      const parsedOptions: ParsedOptions =
        (p.options as ParsedOptions | null) ?? {};

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price / 100,
        image: parsedImages[0] || "/images/placeholder.jpg",
        images: parsedImages,
        description: p.description,
        longDescription: p.description, // using description as both for now
        features: [], // db doesn't have features column yet, maybe tags?
        new:
          parsedOptions.isNew !== undefined
            ? parsedOptions.isNew
            : new Date(p.createdAt) >
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Fallback to 30 days
        featured: p.isFeatured,
        customizable: parsedOptions.customizable ?? true, // Assuming all Ylang creations are customizable
        sizes: parsedOptions.sizes || [],
        defaultSize: parsedOptions.sizes?.[0] || null,
        slug: p.slug,
        compareAtPrice: p.compareAtPrice ? p.compareAtPrice / 100 : null,
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit: limitParam,
        total,
        totalPages: Math.ceil(total / limitParam),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 },
    );
  }
}
