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

// Helper to format DB product to frontend format
function formatProduct(p: typeof productTable.$inferSelect): CatalogProduct {
  let parsedImages: string[] = [];
  try {
    parsedImages = p.images ? JSON.parse(p.images) : [];
  } catch (e) {
    parsedImages = [];
  }

  let parsedOptions: {
    sizes?: string[];
    defaultSize?: string;
    features?: string[];
    longDescription?: string;
    customizable?: boolean;
  } = {};
  try {
    parsedOptions = p.options ? JSON.parse(p.options) : {};
  } catch (e) {
    parsedOptions = {};
  }

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: parseFloat(p.price),
    image: parsedImages[0] || "/images/placeholder.jpg",
    images: parsedImages,
    description: p.description || "",
    longDescription: parsedOptions.longDescription || p.description || "",
    features: parsedOptions.features || [],
    new:
      new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    featured: p.isFeatured,
    customizable: parsedOptions.customizable ?? true,
    sizes: parsedOptions.sizes || [],
    defaultSize:
      parsedOptions.defaultSize || parsedOptions.sizes?.[0] || undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch product from DB
  const [dbProduct] = await db
    .select()
    .from(productTable)
    .where(eq(productTable.id, id))
    .limit(1);

  if (!dbProduct) {
    notFound();
  }

  const product = formatProduct(dbProduct);

  // 2. Fetch similar products (same category, excluding current)
  const similarDbProducts = await db
    .select()
    .from(productTable)
    .where(
      and(
        eq(productTable.category, dbProduct.category),
        ne(productTable.id, dbProduct.id),
      ),
    )
    .limit(4);

  const similarProducts = similarDbProducts.map(formatProduct);

  // 3. Fetch reviews
  const { reviews, averageRating, totalReviews } = await getReviews(product.id);

  // 4. Get current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 5. Render client component
  return (
    <ProductDetails
      product={product}
      similarProducts={similarProducts}
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
