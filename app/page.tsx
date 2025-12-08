"use client";

import { CraftsmanshipSection } from "@/components/home/craftsmanship-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { ProductCard } from "@/components/product/product-card";

export default function Home() {
  const featuredProducts = [
    {
      id: "1",
      name: "Gigoteuse fleurie personnalisée",
      category: "Linge de lit bébé",
      price: 89,
      image: "/images/products/gigoteuse-1.jpg",
      new: true,
      customizable: true,
    },
    {
      id: "2",
      name: "Tour de lit nuage",
      category: "Décoration chambre",
      price: 65,
      image: "/images/products/tour-lit-1.jpg",
      featured: true,
      customizable: true,
    },
    {
      id: "3",
      name: "Ensemble bébé personnalisé",
      category: "Vêtements bébé",
      price: 79,
      image: "/images/products/ensemble2-bébé.jpg",
      customizable: true,
    },
    {
      id: "4",
      name: "Carnet de dessins personnalisé",
      category: "Acessoires",
      price: 4.95,
      image: "/images/products/carnet.jpg",
      customizable: true,
    },
  ];

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

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
