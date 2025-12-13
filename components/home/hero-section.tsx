"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    id: 1,
    // Rose to Terracotta
    bgClass: "bg-gradient-to-br from-ylang-rose to-ylang-terracotta",
    title: "Chaque création naît de vos désirs",
    subtitle: "Personnalisez chaque détail pour un univers unique",
    cta: "Créer maintenant",
    link: "/configurateur",
  },
  {
    id: 2,
    // Terracotta to Sage
    bgClass: "bg-gradient-to-br from-ylang-terracotta to-ylang-sage",
    title: "Savoir-faire artisanal français",
    subtitle: "Une confection soignée pour le confort et la sécurité de bébé",
    cta: "Découvrir l'atelier",
    link: "/a-propos",
  },
  {
    id: 3,
    // Sage to Rose
    bgClass: "bg-gradient-to-br from-ylang-sage to-ylang-rose",
    title: "Nouvelle Collection Printemps",
    subtitle: "Des couleurs douces et des matières naturelles",
    cta: "Voir la collection",
    link: "/collections?filter=new",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="group bg-ylang-beige/10 relative h-[600px] w-full overflow-hidden lg:h-[700px]">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 ${SLIDES[currentSlide].bgClass}`}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Content */}
          {/* <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-display mb-6 max-w-5xl text-4xl leading-tight font-bold text-white drop-shadow-lg md:text-6xl lg:text-7xl"
            >
              {SLIDES[currentSlide].title}
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="font-body mb-10 max-w-2xl text-lg font-light tracking-wide text-white/95 drop-shadow-md md:text-xl"
            >
              {SLIDES[currentSlide].subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <Link href={SLIDES[currentSlide].link}>
                <Button
                  variant="luxury"
                  size="lg"
                  className="px-10 py-6 text-lg tracking-widest uppercase transition-transform duration-300 hover:scale-105"
                >
                  {SLIDES[currentSlide].cta}
                </Button>
              </Link>
            </motion.div>
          </div> */}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 lg:px-8">
        <button
          onClick={prevSlide}
          className="pointer-events-auto -translate-x-4 rounded-full bg-white/10 p-3 text-white/50 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-8 w-8 lg:h-10 lg:w-10" strokeWidth={1} />
        </button>

        <button
          onClick={nextSlide}
          className="pointer-events-auto translate-x-4 rounded-full bg-white/10 p-3 text-white/50 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white"
          aria-label="Next slide"
        >
          <ChevronRight className="h-8 w-8 lg:h-10 lg:w-10" strokeWidth={1} />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-4">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
              index === currentSlide
                ? "w-12 bg-white"
                : "w-4 bg-white/40 hover:w-6 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
