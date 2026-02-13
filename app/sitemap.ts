import { product } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://ylang-creations.vercel.app";

  // Static routes
  const routes = [
    "",
    "/a-propos",
    "/contact",
    "/collections",
    "/configurateur",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch active products
  const products = await db
    .select({
      slug: product.slug,
      updatedAt: product.updatedAt,
    })
    .from(product)
    .where(eq(product.isActive, true));

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/produits/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...routes, ...productRoutes];
}
