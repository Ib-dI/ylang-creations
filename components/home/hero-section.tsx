"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  image: string;
  bgClass?: string;
};

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "1",
    title: "Chaque création naît de vos désirs",
    subtitle: "Personnalisez chaque détail pour un univers unique",
    cta: "Sur mesure",
    link: "/configurateur",
    image: "",
  },
  {
    id: "2",
    title: "Savoir-faire artisanal français",
    subtitle: "Une confection soignée pour le confort de bébé",
    cta: "L'atelier",
    link: "/a-propos",
    image: "",
  },
  {
    id: "3",
    title: "Nouvelle Collection Printemps",
    subtitle: "Des couleurs douces et des matières naturelles",
    cta: "La collection",
    link: "/collections?filter=new",
    image: "",
  },
];

export function HeroSection({ initialSlides }: { initialSlides?: Slide[] }) {
  const [index, setIndex] = useState(0);
  const slides = initialSlides?.length ? initialSlides : DEFAULT_SLIDES;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReduce = useReducedMotion();
  const slide = slides[index];

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      8000,
    );
  }, [slides.length]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const go = useCallback(
    (i: number) => {
      setIndex(i);
      resetTimer();
    },
    [resetTimer],
  );

  const ease = [0.25, 0.1, 0.25, 1] as const;

  const imgFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: shouldReduce ? 0 : 0.55, ease } },
    exit: { opacity: 0, transition: { duration: shouldReduce ? 0 : 0.55, ease } },
  };

  // opacity-only per spec — no translateY
  const textBlock = (delay = 0) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: shouldReduce ? 0 : 0.4, delay: shouldReduce ? 0 : delay, ease } },
    exit: { opacity: 0, transition: { duration: shouldReduce ? 0 : 0.15, ease } },
  });

  return (
    <section
      aria-label="Présentation Ylang Créations"
      className="relative grid overflow-hidden lg:grid-cols-[2fr_3fr]"
      style={{ minHeight: "calc(100svh - 88px)", background: "var(--color-paper)" }}
    >
      {/* ── Colonne texte (gauche) ── */}
      <div className="flex flex-col justify-center px-8 py-20 sm:px-12 lg:px-16 xl:px-20 order-2 lg:order-1">
        <AnimatePresence mode="wait">
          <motion.div key={slide.id} className="max-w-lg">

            {/* Eyebrow */}
            <motion.p
              {...textBlock(0)}
              className="mb-7 text-[11px] uppercase tracking-[0.22em]"
              style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
            >
              Ylang Créations — Artisan Mahorais
            </motion.p>

            {/* H1 — Bricolage Grotesque, jamais en script */}
            <motion.h1
              {...textBlock(0.06)}
              className="mb-5 font-semibold leading-[1.06] tracking-tight
                         text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem]"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              {slide.title}
            </motion.h1>

            {/* Sous-titre — Abramo Script uniquement ici, en accent décoratif */}
            <motion.p
              {...textBlock(0.12)}
              className="mb-10 text-xl leading-relaxed"
              style={{ fontFamily: "var(--font-accent)", color: "var(--color-accent)" }}
            >
              {slide.subtitle}
            </motion.p>

            {/* CTA — lien texte soulignée, pas de bouton massif */}
            <motion.div {...textBlock(0.18)}>
              <Link
                href={slide.link}
                className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.14em]"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)" }}
              >
                <span
                  className="border-b pb-px transition-all duration-300"
                  style={{ borderColor: "var(--color-accent)" }}
                >
                  {slide.cta}
                </span>
                <span
                  className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Dots de navigation */}
        {slides.length > 1 && (
          <div className="mt-14 flex items-center gap-3" role="tablist" aria-label="Navigation des diapositives">
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Diapositive ${i + 1}`}
                onClick={() => go(i)}
                className="h-px transition-all duration-500 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  width: i === index ? "2.5rem" : "1rem",
                  background: i === index ? "var(--color-accent)" : "var(--color-ink-2)",
                  border: "none",
                  cursor: "pointer",
                  outlineColor: "var(--color-accent)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Colonne image (droite) ── */}
      <div
        className="relative h-[56vw] lg:h-auto order-1 lg:order-2"
        style={{ background: "var(--color-paper-3)" }}
      >
        <AnimatePresence mode="sync">
          {slide.image ? (
            <motion.div
              key={slide.id + "-img"}
              {...imgFade}
              className="absolute inset-0"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority
                quality={90}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </motion.div>
          ) : (
            <motion.div
              key={slide.id + "-fallback"}
              {...imgFade}
              className="absolute inset-0 flex items-end p-8"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-paper-3) 0%, var(--color-accent-light) 100%)",
              }}
            >
              <p
                aria-hidden
                className="text-6xl leading-none lg:text-8xl"
                style={{
                  fontFamily: "var(--font-accent)",
                  color: "var(--color-ink)",
                  opacity: 0.12,
                }}
              >
                Ylang
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
