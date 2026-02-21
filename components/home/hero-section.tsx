"use client";

import { Button } from "@/components/ui/button";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  Variants,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_SLIDES = [
  {
    id: "1",
    bgClass: "from-ylang-rose to-ylang-terracotta",
    title: "Chaque création naît de vos désirs",
    subtitle: "Personnalisez chaque détail pour un univers unique",
    cta: "Créer maintenant",
    link: "/configurateur",
    image: "",
  },
  {
    id: "2",
    bgClass: "from-ylang-terracotta to-ylang-sage",
    title: "Savoir-faire artisanal français",
    subtitle: "Une confection soignée pour le confort et la sécurité de bébé",
    cta: "Découvrir l'atelier",
    link: "/a-propos",
    image: "",
  },
  {
    id: "3",
    bgClass: "from-ylang-sage to-ylang-rose",
    title: "Nouvelle Collection Printemps",
    subtitle: "Des couleurs douces et des matières naturelles",
    cta: "Voir la collection",
    link: "/collections?filter=new",
    image: "",
  },
];

interface Slide {
  id: string;
  bgClass?: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
}

interface HeroSectionProps {
  initialSlides?: Slide[];
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.2 + i * 0.1,
      type: "spring",
      stiffness: 200,
      damping: 25,
      mass: 0.4,
    },
  }),
};

export function HeroSection({ initialSlides }: HeroSectionProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [slides] = useState<Slide[]>(
    initialSlides && initialSlides.length > 0 ? initialSlides : DEFAULT_SLIDES,
  );
  const shouldReduceMotion = useReducedMotion();

  const currentSlide = Math.abs(page % slides.length);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const paginate = useCallback(
    (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
    },
    [page],
  );

  // Auto-advance slider
  useEffect(() => {
    if (slides.length <= 1) return;

    timerRef.current = setInterval(() => {
      paginate(1);
    }, 8000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [paginate, slides.length]);

  // Preload next image
  useEffect(() => {
    if (slides.length <= 1) return;
    const nextIndex = (currentSlide + 1) % slides.length;
    if (slides[nextIndex].image) {
      const img = new window.Image();
      img.src = slides[nextIndex].image;
    }
  }, [currentSlide, slides]);

  const currentSlideData = slides[currentSlide];

  return (
    <section
      className="group bg-ylang-beige/10 relative h-[600px] w-full overflow-hidden lg:h-[700px]"
      aria-label="Hero carousel"
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={
            shouldReduceMotion
              ? { opacity: { duration: 0.5 } }
              : {
                  x: {
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    mass: 0.4,
                  },
                  opacity: { duration: 0.2 },
                }
          }
          className={`absolute inset-0 ${currentSlideData.image ? "" : `bg-linear-to-br ${currentSlideData.bgClass || "from-ylang-rose to-ylang-terracotta"}`}`}
        >
          {currentSlideData.image ? (
            <Image
              src={currentSlideData.image}
              alt={currentSlideData.title}
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover"
            />
          ) : null}

          {/* Overlay for better legibility */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <motion.h1
              custom={0}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="font-abramo-script mb-6 max-w-5xl text-4xl leading-tight text-balance text-white drop-shadow-2xl md:text-6xl lg:text-7xl"
            >
              {currentSlideData.title}
            </motion.h1>

            <motion.p
              custom={1}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="font-body mb-10 max-w-2xl text-lg font-light tracking-wide text-pretty text-white/95 drop-shadow-lg md:text-xl"
            >
              {currentSlideData.subtitle}
            </motion.p>

            <motion.div
              custom={2}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
            >
              <Link href={currentSlideData.link || "/"}>
                <Button
                  variant="luxury"
                  size="lg"
                  className="px-10 py-6 text-lg tracking-widest uppercase transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {currentSlideData.cta || "Découvrir"}
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => paginate(-1)}
            className="pointer-events-auto -translate-x-4 rounded-full bg-white/10 p-3 text-white/50 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-hidden"
            aria-label="Diapositive précédente"
          >
            <ChevronLeft
              className="h-6 w-6 lg:h-10 lg:w-10"
              strokeWidth={1.5}
            />
          </button>

          <button
            onClick={() => paginate(1)}
            className="pointer-events-auto translate-x-4 rounded-full bg-white/10 p-3 text-white/50 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-hidden"
            aria-label="Diapositive suivante"
          >
            <ChevronRight
              className="h-6 w-6 lg:h-10 lg:w-10"
              strokeWidth={1.5}
            />
          </button>
        </div>
      )}

      {/* Indicators */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-4"
          role="tablist"
          aria-label="Navigation du carrousel"
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const diff = index - currentSlide;
                if (diff !== 0) paginate(diff);
              }}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Aller à la diapositive ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden ${
                index === currentSlide
                  ? "w-12 bg-white"
                  : "w-4 bg-white/40 hover:w-6 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
