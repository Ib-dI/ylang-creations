"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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

interface Slide {
  id: string;
  bgClass?: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
}

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch settings
  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.heroSlides && data.heroSlides.length > 0) {
          setSlides(data.heroSlides);
        }
      })
      .catch(console.error);
  }, []);

  // Auto-advance slider avec cleanup
  useEffect(() => {
    if (slides.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [slides.length]);

  // Préchargement de l'image suivante
  useEffect(() => {
    if (slides.length <= 1) return;
    const nextIndex = (currentSlide + 1) % slides.length;
    if (slides[nextIndex].image) {
      const img = new window.Image();
      img.src = slides[nextIndex].image;
    }
  }, [currentSlide, slides]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [isTransitioning, slides.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentSlide) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 1000);
    },
    [isTransitioning, currentSlide],
  );

  const currentSlideData = slides[currentSlide];

  return (
    <section
      className="group bg-ylang-beige/10 relative h-[600px] w-full overflow-hidden lg:h-[700px]"
      aria-label="Hero carousel"
    >
      {/* Background avec transition CSS pure */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } ${slide.image ? "" : slide.bgClass || "from-ylang-rose to-ylang-terracotta bg-linear-to-br"}`}
            style={
              slide.image
                ? {
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}
            }
          >
            {/* Optimisation: Image avec Next/Image si disponible */}
            {slide.image && (
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                quality={90}
                sizes="100vw"
                className="object-cover"
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
      </div>

      {/* Content avec animations CSS */}
      {/* <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h1
          key={`title-${currentSlide}`}
          className="font-display mb-6 max-w-5xl text-4xl font-bold leading-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          {currentSlideData.title}
        </h1>

        <p
          key={`subtitle-${currentSlide}`}
          className="font-body mb-10 max-w-2xl text-lg font-light tracking-wide text-white/95 drop-shadow-md md:text-xl animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          {currentSlideData.subtitle}
        </p>

        <div
          key={`cta-${currentSlide}`}
          className="animate-fade-in-up"
          style={{ animationDelay: '0.7s' }}
        >
          <Link href={currentSlideData.link || "/"}>
            <Button
              variant="luxury"
              size="lg"
              className="px-10 py-6 text-lg uppercase tracking-widest transition-transform duration-300 hover:scale-105"
            >
              {currentSlideData.cta || "Découvrir"}
            </Button>
          </Link>
        </div>
      </div> */}

      {/* Navigation Arrows - Visible seulement si plusieurs slides */}
      {slides.length > 1 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="pointer-events-auto -translate-x-4 rounded-full bg-white/10 p-3 text-white/50 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Diapositive précédente"
          >
            <ChevronLeft
              className="h-6 w-6 lg:h-10 lg:w-10"
              strokeWidth={1.5}
            />
          </button>

          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="pointer-events-auto translate-x-4 rounded-full bg-white/10 p-3 text-white/50 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Diapositive suivante"
          >
            <ChevronRight
              className="h-6 w-6 lg:h-10 lg:w-10"
              strokeWidth={1.5}
            />
          </button>
        </div>
      )}

      {/* Indicators - Visible seulement si plusieurs slides */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-4"
          role="tablist"
          aria-label="Navigation du carrousel"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Aller à la diapositive ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out disabled:cursor-not-allowed ${
                index === currentSlide
                  ? "w-12 bg-white"
                  : "w-4 bg-white/40 hover:w-6 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out both;
        }
      `}</style>
    </section>
  );
}
