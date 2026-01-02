import { CraftsmanshipSection } from "@/components/home/craftsmanship-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { ProductCard } from "@/components/product/product-card";
import type { CatalogProduct } from "@/data/products";
import { product as productTable } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";

async function FeaturedProductsData() {
  // Force dynamic rendering to always get fresh data
  noStore();

  // Fetch featured products using Drizzle (consistent with rest of app)
  const products = await db
    .select()
    .from(productTable)
    .where(and(eq(productTable.isActive, true), eq(productTable.isFeatured, true)))
    .orderBy(desc(productTable.createdAt))
    .limit(4);

  // Calculate threshold date outside of map function
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Format products to match CatalogProduct type
  const formattedProducts: CatalogProduct[] = products.map((p) => {
    let parsedImages: string[] = [];
    try {
      parsedImages = p.images ? JSON.parse(p.images) : [];
    } catch {
      parsedImages = [];
    }

    interface ParsedOptions {
      sizes?: string[];
    }

    let parsedOptions: ParsedOptions = {};
    try {
      parsedOptions = p.options ? JSON.parse(p.options) : {};
    } catch {
      parsedOptions = {};
    }

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      price: parseFloat(p.price),
      image: parsedImages[0] || "/images/placeholder.jpg",
      images: parsedImages,
      description: p.description || "",
      longDescription: p.description || "",
      features: [],
      new: new Date(p.createdAt) > thirtyDaysAgo,
      featured: p.isFeatured,
      customizable: true,
      sizes: parsedOptions.sizes || [],
      defaultSize: parsedOptions.sizes?.[0] || undefined,
      slug: p.slug,
    };
  });

  if (formattedProducts.length === 0) {
    return (
      <div className="text-ylang-charcoal/60 col-span-full py-12 text-center">
        Nos nouvelles créations arrivent bientôt...
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {formattedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-body text-ylang-rose mb-3 text-sm tracking-widest uppercase">
              Collections printemps
            </p>
            <h2 className="font-display text-ylang-charcoal mb-4 text-4xl lg:text-5xl">
              Nos créations phares
            </h2>
            <p className="font-body text-ylang-charcoal/60 mx-auto max-w-2xl text-lg">
              Découvrez notre sélection de produits personnalisables pour créer
              un univers unique
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
              </div>
            }
          >
            <FeaturedProductsData />
          </Suspense>
        </div>
      </section>
      {/* Savoir-faire */}
      <CraftsmanshipSection />

      {/* Comment ça marche */}
      <HowItWorksSection />

      {/* Témoignages */}
      <TestimonialsSection />
    </>
  );
}
