"use client";

import { Button } from "@/components/ui/button";
import { motion, MotionConfig, useMotionTemplate, useSpring, useReducedMotion, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_SLIDES = [
  { id: "1", bgClass: "from-ylang-rose to-ylang-terracotta", title: "Chaque création naît de vos désirs", subtitle: "Personnalisez chaque détail pour un univers unique", cta: "Créer maintenant", link: "/configurateur", image: "" },
  { id: "2", bgClass: "from-ylang-terracotta to-ylang-sage", title: "Savoir-faire artisanal français", subtitle: "Une confection soignée pour le confort et la sécurité de bébé", cta: "Découvrir l'atelier", link: "/a-propos", image: "" },
  { id: "3", bgClass: "from-ylang-sage to-ylang-rose", title: "Nouvelle Collection Printemps", subtitle: "Des couleurs douces et des matières naturelles", cta: "Voir la collection", link: "/collections?filter=new", image: "" },
];

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.3 + i * 0.1, type: "spring", stiffness: 150, damping: 25 } }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export function HeroSection({ initialSlides }: { initialSlides?: typeof DEFAULT_SLIDES }) {
  const [index, setIndex] = useState(0);
  const slides = initialSlides?.length ? initialSlides : DEFAULT_SLIDES;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReduce = useReducedMotion();

  const x = index * 100;
  const xSpring = useSpring(x, { bounce: 0 });
  const xPct = useMotionTemplate`-${xSpring}%`;

  useEffect(() => { xSpring.set(x); }, [x, xSpring]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % slides.length), 8000);
  }, [slides.length]);

  const paginate = useCallback((delta: number) => {
    setIndex(i => (i + delta + slides.length) % slides.length);
    resetTimer();
  }, [slides.length, resetTimer]);

  useEffect(() => {
    resetTimer();
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, [resetTimer]);

  return (
    <MotionConfig transition={{ type: "spring", bounce: 0 }}>
      <section className="group relative h-[600px] w-full overflow-hidden lg:h-[700px]">
        <motion.div style={{ x: xPct }} className="flex h-full">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`relative h-full w-full flex-shrink-0 ${slide.image ? "" : `bg-gradient-to-br ${slide.bgClass}`}`}
            >
              {slide.image && (
                <Image src={slide.image} alt={slide.title} fill priority={i === 0} quality={90} sizes="100vw" className="object-cover" />
              )}
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
                <motion.h1 custom={0} variants={contentVariants} initial={false} animate={i === index ? "visible" : "hidden"}
                  className="font-abramo-script mb-6 max-w-5xl text-4xl md:text-6xl lg:text-7xl leading-tight drop-shadow-2xl">
                  {slide.title}
                </motion.h1>
                <motion.p custom={1} variants={contentVariants} initial={false} animate={i === index ? "visible" : "hidden"}
                  className="mb-10 max-w-2xl text-lg md:text-xl font-light drop-shadow-lg">
                  {slide.subtitle}
                </motion.p>
                <motion.div custom={2} variants={contentVariants} initial={false} animate={i === index ? "visible" : "hidden"}>
                  <Link href={slide.link}>
                    <Button variant="luxury" size="lg" className="px-10 py-6 text-lg uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95">
                      {slide.cta}
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          ))}
        </motion.div>

        {slides.length > 1 && (
          <>
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-4 lg:px-8">
              <button onClick={() => paginate(-1)}
                className="pointer-events-auto rounded-full bg-white/10 p-3 text-white/50 opacity-0 backdrop-blur-sm transition group-hover:opacity-100 group-hover:translate-x-0 hover:bg-white/20 -translate-x-4 transition-all duration-300"
                aria-label="Diapositive précédente">
                <ChevronLeft className="h-6 w-6 lg:h-10 lg:w-10" strokeWidth={1.5} />
              </button>
              <button onClick={() => paginate(1)}
                className="pointer-events-auto rounded-full bg-white/10 p-3 text-white/50 opacity-0 backdrop-blur-sm transition group-hover:opacity-100 group-hover:translate-x-0 hover:bg-white/20 translate-x-4 transition-all duration-300"
                aria-label="Diapositive suivante">
                <ChevronRight className="h-6 w-6 lg:h-10 lg:w-10" strokeWidth={1.5} />
              </button>
            </div>

            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-4">
              {slides.map((_, i) => (
                <button key={i} onClick={() => paginate(i - index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-12 bg-white" : "w-4 bg-white/40 hover:w-6 hover:bg-white/60"}`}
                  role="tablist"
                  aria-label="Navigation des diapositives" />
              ))}
            </div>
          </>
        )}
      </section>
    </MotionConfig>
  );
}