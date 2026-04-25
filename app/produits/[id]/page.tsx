import ProductDetails from "@/components/product/product-details";
import { CatalogProduct } from "@/data/products";
import { product as productTable } from "@/db/schema";
import { getReviews } from "@/lib/actions/reviews";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";
import { and, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatProduct(p: typeof productTable.$inferSelect): CatalogProduct {
  const parsedImages = (p.images as string[] | null) ?? [];

  let parsedOptions: {
    features?: string[];
    longDescription?: string;
    customizable?: boolean;
  } = (p.options as typeof parsedOptions | null) ?? {};

  const parsedSizes = (p.sizes as string[] | null) ?? [];

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price / 100,
    image: parsedImages[0] || "/images/placeholder.jpg",
    images: parsedImages,
    description: p.description || "",
    longDescription: parsedOptions.longDescription || p.description || "",
    features: parsedOptions.features || [],
    new:
      new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    featured: p.isFeatured,
    customizable: parsedOptions.customizable ?? true,
    sizes: parsedSizes,
    defaultSize: p.defaultSize ?? parsedSizes[0] ?? undefined,
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice / 100 : null,
    weight: p.weight ?? 0,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const [dbProduct] = await db
    .select()
    .from(productTable)
    .where(eq(productTable.id, id))
    .limit(1);

  if (!dbProduct) {
    notFound();
  }

  const product = formatProduct(dbProduct);

  const [similarDbProducts, { reviews, averageRating, totalReviews }, supabase] =
    await Promise.all([
      db
        .select()
        .from(productTable)
        .where(
          and(
            eq(productTable.category, dbProduct.category),
            ne(productTable.id, dbProduct.id),
          ),
        )
        .limit(4),
      getReviews(product.id),
      createClient(),
    ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ProductDetails
      product={product}
      similarProducts={similarDbProducts.map(formatProduct)}
      reviews={reviews}
      averageRating={averageRating}
      totalReviews={totalReviews}
      currentUser={
        user
          ? {
              id: user.id,
              name: user.user_metadata.name || "",
              email: user.email || "",
              image: user.user_metadata.avatar_url || null,
            }
          : null
      }
    />
  );
}
