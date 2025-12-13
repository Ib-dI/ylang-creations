import { product } from "@/db/schema";
import { db } from "@/lib/db";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");

    // Base query: Only active products for public view
    let conditions = [eq(product.isActive, true)];

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
      // Cast to float for sorting because price is string in DB
      orderBy = sql`CAST(${product.price} AS FLOAT)`; // Default asc
    } else if (sort === "price-desc") {
      orderBy = sql`CAST(${product.price} AS FLOAT) DESC`;
    } else if (sort === "name") {
      orderBy = asc(product.name);
    }

    let query = db
      .select()
      .from(product)
      .where(and(...conditions))
      .orderBy(orderBy);

    if (limit) {
      // @ts-ignore
      query = query.limit(parseInt(limit));
    }

    const products = await query;

    // Format for frontend
    const formattedProducts = products.map((p) => {
      let parsedImages = [];
      try {
        parsedImages = p.images ? JSON.parse(p.images) : [];
      } catch (e) {
        // Fallback if not valid JSON
        parsedImages = []; // or [p.images] if it was a plain string? assuming array format
      }

      let parsedOptions = {};
      try {
        parsedOptions = p.options ? JSON.parse(p.options) : {};
      } catch (e) {
        parsedOptions = {};
      }

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: parseFloat(p.price),
        image: parsedImages[0] || "/images/placeholder.jpg",
        images: parsedImages,
        description: p.description,
        longDescription: p.description, // using description as both for now
        features: [], // db doesn't have features column yet, maybe tags?
        new:
          new Date(p.createdAt) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // New if < 30 days
        featured: p.isFeatured,
        customizable: true, // Assuming all Ylang creations are customizable
        sizes: (parsedOptions as any).sizes || [],
        defaultSize: (parsedOptions as any).sizes?.[0] || null,
        slug: p.slug,
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 },
    );
  }
}
