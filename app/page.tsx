import { CraftsmanshipSection } from "@/components/home/craftsmanship-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { ProductCard } from "@/components/product/product-card";
import type { CatalogProduct } from "@/data/products";
import { product as productTable } from "@/db/schema";
import { getCachedSettings } from "@/lib/actions/settings";
import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

// Fonction de formatage réutilisable
function formatProduct(p: any, thirtyDaysAgo: Date): CatalogProduct {
  let parsedImages: string[] = [];
  try {
    parsedImages = p.images ? JSON.parse(p.images) : [];
  } catch {
    parsedImages = [];
  }

  interface ParsedOptions {
    sizes?: string[];
    customizable?: boolean;
    isNew?: boolean;
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
    price: p.price / 100,
    image: parsedImages[0] || "/images/placeholder.jpg",
    images: parsedImages,
    description: p.description || "",
    longDescription: p.description || "",
    features: [],
    new: parsedOptions.isNew ?? new Date(p.createdAt) > thirtyDaysAgo,
    featured: p.isFeatured,
    customizable: parsedOptions.customizable ?? true,
    sizes: parsedOptions.sizes || [],
    defaultSize: parsedOptions.sizes?.[0] || undefined,
    slug: p.slug,
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice / 100 : null,
  };
}

async function FeaturedProductsData() {
  // Fetch featured products
  const products = await db
    .select()
    .from(productTable)
    .where(
      and(eq(productTable.isActive, true), eq(productTable.isFeatured, true)),
    )
    .orderBy(desc(productTable.createdAt))
    .limit(4);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const formattedProducts: CatalogProduct[] = products.map((p) =>
    formatProduct(p, thirtyDaysAgo),
  );

  if (formattedProducts.length === 0) {
    return (
      <div className="text-ylang-charcoal/60 col-span-full py-12 text-center">
        Nos nouvelles créations arrivent bientôt...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
      {formattedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Composant de fallback optimisé
function ProductsLoadingFallback() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden bg-white shadow-sm"
        >
          <div className="aspect-4/5 bg-gray-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  const result = await getCachedSettings();
  const settings = result[0];

  let heroSlides: any[] = [];
  try {
    if (settings?.heroSlides) {
      heroSlides = JSON.parse(settings.heroSlides as string);
    }
  } catch (err) {
    console.error("Error parsing heroSlides:", err);
  }

  return (
    <>
      {/* Hero Section - Critical, pas de Suspense */}
      <HeroSection initialSlides={heroSlides} />

      {/* Featured Products avec Suspense pour streaming */}
      <section className="section-padding bg-ylang-terracotta/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-abramo text-ylang-rose mb-3 text-sm font-semibold tracking-widest uppercase">
              Collections printemps
            </p>
            <h2 className="font-abramo-script text-ylang-charcoal mb-4 text-4xl lg:text-5xl">
              Nos créations phares
            </h2>
            <p className="font-body text-ylang-charcoal/60 mx-auto max-w-2xl text-lg">
              Découvrez notre sélection de produits personnalisables pour créer
              un univers unique
            </p>
          </div>

          <Suspense fallback={<ProductsLoadingFallback />}>
            <FeaturedProductsData />
          </Suspense>
        </div>
      </section>

      {/* Sections avec lazy loading via Suspense */}
      <Suspense
        fallback={
          <div className="bg-ylang-cream flex h-96 items-center justify-center">
            <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
          </div>
        }
      >
        <CraftsmanshipSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center bg-white">
            <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
          </div>
        }
      >
        <HowItWorksSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-ylang-cream flex h-96 items-center justify-center">
            <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
          </div>
        }
      >
        <TestimonialsSection />
      </Suspense>
    </>
  );
}
