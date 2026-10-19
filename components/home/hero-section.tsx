"use client";

import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const AUTOPLAY_MS = 8000;
const SWIPE_THRESHOLD = 50;
const IMG_FADE_MS = 700;

export function HeroSection({ initialSlides }: { initialSlides?: Slide[] }) {
  const slides = initialSlides?.length ? initialSlides : DEFAULT_SLIDES;
  const count = slides.length;
  // prev = slide sortante, gardée visible sous la nouvelle pendant le fondu
  const [{ index: rawIndex, prev: rawPrev }, setPosition] = useState({
    index: 0,
    prev: 0,
  });
  // Garde-fou si la liste de slides rétrécit
  const index = rawIndex < count ? rawIndex : 0;
  const prevIndex = rawPrev < count ? rawPrev : 0;
  const shouldReduce = useReducedMotion();

  const [hasFocus, setHasFocus] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const paused = hasFocus || isTabHidden;

  const go = useCallback(
    (i: number) =>
      setPosition((p) => {
        const target = (i + count) % count;
        return target === p.index ? p : { index: target, prev: p.index };
      }),
    [count],
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Un timeout par slide : toute navigation manuelle relance le compte à rebours
  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [paused, count, next]);

  // Fondu terminé : l'ancienne slide n'a plus besoin de rester sous la nouvelle
  useEffect(() => {
    if (prevIndex === index) return;
    const t = setTimeout(
      () => setPosition((p) => ({ ...p, prev: p.index })),
      IMG_FADE_MS,
    );
    return () => clearTimeout(t);
  }, [index, prevIndex]);

  useEffect(() => {
    const onVisibility = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || count <= 1) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Swipe horizontal uniquement, pour ne pas gêner le scroll vertical
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };

  // Transitions CSS plutôt que Framer Motion : en fin d'animation, Framer
  // réaffichait l'élément sortant pendant une frame (effet « revient et repart »).
  const ease = "cubic-bezier(0.25, 0.1, 0.25, 1)";

  // Toutes les slides restent montées et empilées : la hauteur du bloc texte
  // est celle de la plus longue (plus de saut de mise en page) et les images
  // sont déjà chargées avant d'apparaître.
  const fade = (active: boolean, delay = 0): React.CSSProperties => ({
    opacity: active ? 1 : 0,
    transition: shouldReduce
      ? "none"
      : active
        ? // léger chevauchement avec la sortie : pas de trou visible
          `opacity 450ms ${ease} ${100 + delay}ms`
        : `opacity 200ms ${ease}`,
  });

  // Fondu enchaîné sans creux : la nouvelle image passe de 0 à 1 PAR-DESSUS
  // l'ancienne, qui reste opaque en dessous jusqu'à la fin du fondu.
  const imgLayer = (i: number): React.CSSProperties => {
    if (i === index) {
      return {
        zIndex: 2,
        opacity: 1,
        transition: shouldReduce ? "none" : `opacity ${IMG_FADE_MS}ms ${ease}`,
      };
    }
    if (i === prevIndex) return { zIndex: 1, opacity: 1, transition: "none" };
    return { zIndex: 0, opacity: 0, transition: "none" };
  };

  const controlClass =
    "flex size-11 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[var(--color-paper-3)] focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <section
      aria-label="Présentation Ylang Créations"
      aria-roledescription="carrousel"
      className="relative grid overflow-hidden lg:grid-cols-[2fr_3fr]"
      style={{
        minHeight: "calc(100svh - 88px)",
        background: "var(--color-paper)",
      }}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onFocus={(e) => {
        // Pause seulement pour la navigation clavier, pas après un clic souris
        if (e.target.matches(":focus-visible")) setHasFocus(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setHasFocus(false);
        }
      }}
    >
      {/* ── Colonne texte (gauche) ── */}
      <div className="order-2 flex flex-col justify-center px-8 py-20 sm:px-12 lg:order-1 lg:px-16 xl:px-20">
        {/* Eyebrow — identique sur toutes les slides, donc hors du fondu */}
        <p
          className="mb-7 text-xs font-semibold tracking-[0.22em] uppercase"
          style={{
            fontFamily: "var(--font-brand)",
            color: "var(--color-accent)",
          }}
        >
          Ylang Créations — Artisan Mahorais
        </p>

        <div className="grid" aria-live={paused ? "polite" : "off"}>
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <div
                key={s.id}
                className="col-start-1 row-start-1 max-w-lg"
                aria-hidden={!active}
                inert={!active}
                role="group"
                aria-roledescription="diapositive"
                aria-label={`${i + 1} sur ${count}`}
              >
                {/* H1 — Adobe Garamond Pro, regular italic */}
                <h1
                  className="type-display mb-5 text-4xl"
                  style={{
                    ...fade(active, 0),
                    color: "var(--color-ink)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {s.title}
                </h1>

                {/* Sous-titre — Inter uppercase */}
                <p
                  className="type-overline mb-10 leading-relaxed"
                  style={{
                    ...fade(active, 60),
                    fontSize: "var(--text-caption)",
                    color: "var(--color-ink-2)",
                  }}
                >
                  {s.subtitle}
                </p>

                {/* CTA — lien texte soulignée, pas de bouton massif */}
                <div style={fade(active, 120)}>
                  <Link
                    href={s.link}
                    className="group inline-flex items-center gap-2 text-sm tracking-[0.14em] uppercase"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-ink)",
                    }}
                  >
                    <span
                      className="border-b pb-px transition-colors duration-300"
                      style={{ borderColor: "var(--color-accent)" }}
                    >
                      {s.cta}
                    </span>
                    <span
                      className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contrôles de navigation */}
        {count > 1 && (
          <div
            className="mt-12 -ml-3 flex items-center gap-1"
            style={{ color: "var(--color-ink)" }}
          >
            <button
              type="button"
              onClick={prev}
              aria-label="Diapositive précédente"
              className={controlClass}
              style={{ outlineColor: "var(--color-accent)" }}
            >
              <ChevronLeft className="size-5" strokeWidth={1.5} />
            </button>

            <div className="flex items-center">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Aller à la diapositive ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => go(i)}
                  // Zone cliquable de 44px de haut autour d'un trait fin
                  className="flex h-11 items-center px-1.5 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ outlineColor: "var(--color-accent)" }}
                >
                  <span
                    className="block h-0.5 rounded-full transition-[width,background-color] duration-500"
                    style={{
                      width: i === index ? "2.5rem" : "1rem",
                      background:
                        i === index
                          ? "var(--color-accent)"
                          : "var(--color-ink-2)",
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              aria-label="Diapositive suivante"
              className={controlClass}
              style={{ outlineColor: "var(--color-accent)" }}
            >
              <ChevronRight className="size-5" strokeWidth={1.5} />
            </button>

            <span
              aria-hidden
              className="ml-2 text-xs tracking-[0.14em] tabular-nums"
              style={{ color: "var(--color-ink-2)" }}
            >
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* ── Colonne image (droite) ── */}
      <div
        className="relative order-1 h-[56vw] lg:order-2 lg:h-auto"
        style={{ background: "var(--color-paper-3)" }}
      >
        {slides.map((s, i) => {
          const active = i === index;
          return s.image ? (
            <div
              key={s.id + "-img"}
              className="absolute inset-0"
              style={imgLayer(i)}
              aria-hidden={!active}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={i === 0}
                quality={90}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              key={s.id + "-fallback"}
              className="absolute inset-0 flex items-end p-8"
              style={{
                ...imgLayer(i),
                background:
                  "linear-gradient(145deg, var(--color-paper-3) 0%, var(--color-accent-light) 100%)",
              }}
              aria-hidden
            >
              <p
                className="text-6xl leading-none lg:text-8xl"
                style={{
                  fontFamily: "var(--font-accent)",
                  color: "var(--color-ink)",
                  opacity: 0.12,
                }}
              >
                Ylang
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
