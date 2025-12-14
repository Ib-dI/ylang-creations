"use client";

import { CraftsmanshipSection } from "@/components/home/craftsmanship-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { ProductCard } from "@/components/product/product-card";
import type { CatalogProduct } from "@/data/products";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<CatalogProduct[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Fetch featured products, limit to 4
        const response = await fetch("/api/products?featured=true&limit=4");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error fetching featured products:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error || "Unknown error",
          });
          return;
        }
        
        const data = await response.json();
        if (data.products) {
          setFeaturedProducts(data.products);
        } else {
          console.warn("No products in response:", data);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

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

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="text-ylang-rose h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="text-ylang-charcoal/60 col-span-full py-12 text-center">
                  Nos nouvelles créations arrivent bientôt...
                </div>
              )}
            </div>
          )}
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
