"use client";

import { CraftsmanshipSection } from "@/components/home/craftsmanship-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { ProductCard } from "@/components/product/product-card";
import { motion } from "framer-motion";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import Link from "next/link";

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
      image: "/images/products/ensemble-bebe.jpg",
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
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative hidden lg:block"
      >
        <div className="relative mt-26 aspect-[5/2] overflow-hidden">
          {/* Hero Section */}
          <Image
            src="/images/hero-section.jpg"
            alt="Produit Ylang Créations"
            fill
            className="object-cover"
            priority
          />

          {/* Overlay Content */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="font-display mb-8 max-w-4xl px-4 text-4xl leading-tight font-bold text-white drop-shadow-lg md:text-6xl"
            >
              Chaque création naît de vos désirs
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex gap-6"
            >
              <Link href="/configurateur">
                <Button variant="luxury" size="lg" className="px-8 text-lg">
                  Créer
                </Button>
              </Link>
              <Link href="/collections">
                <Button
                  variant="secondary"
                  size="lg"
                  className="hover:text-ylang-charcoal border-white bg-white/10 px-8 text-lg text-white backdrop-blur-sm hover:border-white hover:bg-white"
                >
                  Découvrir
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

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
