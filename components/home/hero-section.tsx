"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DEFAULT_SLIDES = [
  {
    id: "1",
    bgClass: "bg-gradient-to-br from-ylang-rose to-ylang-terracotta",
    title: "Chaque création naît de vos désirs",
    subtitle: "Personnalisez chaque détail pour un univers unique",
    cta: "Créer maintenant",
    link: "/configurateur",
    image: "",
  },
  {
    id: "2",
    bgClass: "bg-gradient-to-br from-ylang-terracotta to-ylang-sage",
    title: "Savoir-faire artisanal français",
    subtitle: "Une confection soignée pour le confort et la sécurité de bébé",
    cta: "Découvrir l'atelier",
    link: "/a-propos",
    image: "",
  },
  {
    id: "3",
    bgClass: "bg-gradient-to-br from-ylang-sage to-ylang-rose",
    title: "Nouvelle Collection Printemps",
    subtitle: "Des couleurs douces et des matières naturelles",
    cta: "Voir la collection",
    link: "/collections?filter=new",
    image: "",
  },
];


export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(DEFAULT_SLIDES);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.heroSlides && data.heroSlides.length > 0) {
          setSlides(data.heroSlides);
        }
      })
      .catch(console.error);
  }, []);

  // Auto-advance slider
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
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
          className={`absolute inset-0 ${
            slides[currentSlide].image
              ? ""
              : slides[currentSlide].bgClass ||
                "bg-linear-to-br from-ylang-rose to-ylang-terracotta"
          }`}
          style={
            slides[currentSlide].image
              ? {
                  backgroundImage: `url(${slides[currentSlide].image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}
          }
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Content */}
          {/* <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-display mb-6 max-w-5xl text-4xl font-bold leading-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl"
            >
              {slides[currentSlide].title}
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="font-body mb-10 max-w-2xl text-lg font-light tracking-wide text-white/95 drop-shadow-md md:text-xl"
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <Link href={slides[currentSlide].link || "/"}>
                <Button
                  variant="luxury"
                  size="lg"
                  className="px-10 py-6 text-lg uppercase tracking-widest transition-transform duration-300 hover:scale-105"
                >
                  {slides[currentSlide].cta || "Découvrir"}
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
          <ChevronLeft className="h-4 w-4 lg:h-10 lg:w-10" strokeWidth={1} />
        </button>

        <button
          onClick={nextSlide}
          className="pointer-events-auto translate-x-4 rounded-full bg-white/10 p-3 text-white/50 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4 lg:h-10 lg:w-10" strokeWidth={1} />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-4">
        {slides.map((_, index) => (
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
