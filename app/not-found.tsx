"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ── Variantes d'animation ─────────────────────────────────────────── */
const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.11, delayChildren: 0.25 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ── Marques de coupe aux coins (style patron de couture) ──────────── */
function CornerMark({
  position,
}: {
  position: "tl" | "tr" | "bl" | "br";
}) {
  const paths: Record<string, string> = {
    tl: "M0 28 L0 0 L28 0",
    tr: "M28 28 L28 0 L0 0",
    bl: "M0 0 L0 28 L28 28",
    br: "M28 0 L28 28 L0 28",
  };
  const pos: Record<string, string> = {
    tl: "top-5 left-5",
    tr: "top-5 right-5",
    bl: "bottom-5 left-5",
    br: "bottom-5 right-5",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.8 }}
      className={`absolute ${pos[position]}`}
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d={paths[position]}
          stroke="#a77769"
          strokeWidth="1"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

/* ── Thread décoratif (courbe SVG animée) ──────────────────────────── */
function AnimatedThread({
  className,
  delay = 0,
  d,
  width = 320,
  height = 40,
  viewBox = "0 0 320 40",
}: {
  className?: string;
  delay?: number;
  d: string;
  width?: number;
  height?: number;
  viewBox?: string;
}) {
  return (
    <motion.svg
      className={`pointer-events-none absolute ${className}`}
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
    >
      <motion.path
        d={d}
        stroke="#a77769"
        strokeWidth="1"
        strokeOpacity="0.22"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay, duration: 2.2, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

/* ── Page principale ───────────────────────────────────────────────── */
export default function NotFound() {
  return (
    <div
      className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 py-20"
      style={{
        backgroundColor: "#faf9f6",
        backgroundImage: `
          linear-gradient(rgba(167,119,105,0.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(167,119,105,0.055) 1px, transparent 1px)
        `,
        backgroundSize: "44px 44px",
      }}
    >
      {/* Marques de coupe */}
      <CornerMark position="tl" />
      <CornerMark position="tr" />
      <CornerMark position="bl" />
      <CornerMark position="br" />

      {/* Halos atmosphériques */}
      <motion.div
        className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(213,178,169,0.18) 0%, transparent 65%)",
        }}
        animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,203,159,0.14) 0%, transparent 65%)",
        }}
        animate={{ x: [0, -16, 0], y: [0, 16, 0] }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Threads décoratifs */}
      <AnimatedThread
        className="top-[18%] left-0 opacity-70"
        delay={1.8}
        d="M0 20 Q 80 5, 160 20 Q 240 35, 320 20"
        width={320}
        height={40}
        viewBox="0 0 320 40"
      />
      <AnimatedThread
        className="bottom-[20%] right-0 opacity-70"
        delay={2.2}
        d="M320 20 Q 240 5, 160 20 Q 80 35, 0 20"
        width={320}
        height={40}
        viewBox="0 0 320 40"
      />

      {/* Contenu centré */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-lg flex-col items-center text-center"
      >
        {/* Étiquette de marque */}
        <motion.div
          variants={fadeUp}
          className="mb-10 flex items-center gap-3"
        >
          <span
            className="h-px w-10 bg-ylang-rose/30"
            style={{ background: "#a77769", opacity: 0.3 }}
          />
          <span
            className="font-abramo text-xs uppercase tracking-[0.32em]"
            style={{ color: "#a77769", opacity: 0.65 }}
          >
            Ylang Créations
          </span>
          <span
            className="h-px w-10"
            style={{ background: "#a77769", opacity: 0.3, height: 1 }}
          />
        </motion.div>

        {/* 404 — chiffres animés individuellement */}
        <div
          className="relative flex items-baseline"
          style={{ gap: "clamp(0.25rem, 2vw, 1rem)" }}
        >
          {(
            [
              { digit: "4", delay: 0.3, rotate: -10, fromY: 70 },
              { digit: "0", delay: 0.45, rotate: 0, fromY: -60 },
              { digit: "4", delay: 0.6, rotate: 10, fromY: 70 },
            ] as const
          ).map(({ digit, delay, rotate, fromY }, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: fromY, rotate }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{
                delay,
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-abramo-script leading-none select-none"
              style={{
                fontSize: "clamp(7rem, 20vw, 15rem)",
                color: i === 1 ? "#a77769" : "#d5b2a9",
                lineHeight: 0.9,
              }}
            >
              {digit}
            </motion.span>
          ))}

          {/* Point décoratif flottant */}
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5, ease: "backOut" }}
            className="absolute -top-2 -right-5 text-2xl"
            style={{ color: "#e8cb9f" }}
          >
            ✦
          </motion.span>
        </div>

        {/* Séparateur raffiné */}
        <motion.div
          variants={fadeUp}
          className="my-8 flex w-full items-center gap-4"
        >
          <span className="h-px flex-1" style={{ background: "rgba(25,25,28,0.12)" }} />
          <span style={{ color: "#d5b2a9", fontSize: "0.65rem", letterSpacing: "0.2em" }}>
            PAGE INTROUVABLE
          </span>
          <span className="h-px flex-1" style={{ background: "rgba(25,25,28,0.12)" }} />
        </motion.div>

        {/* Titre */}
        <motion.h1
          variants={fadeUp}
          className="font-display mb-4 text-2xl font-medium md:text-[1.75rem]"
          style={{ color: "#19191c", letterSpacing: "-0.02em" }}
        >
          Cette page s&apos;est effilochée
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="font-body mb-10 max-w-[28rem] text-sm leading-relaxed"
          style={{ color: "rgba(25,25,28,0.5)" }}
        >
          Le fil qui vous a mené ici ne conduit nulle part. La page recherchée a
          peut-être été déplacée ou n&apos;existe plus dans notre collection.
        </motion.p>

        {/* Boutons d'action */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="/"
            className="font-body inline-flex h-12 items-center rounded-full px-8 text-sm tracking-wide transition-all duration-300"
            style={{
              backgroundColor: "#a77769",
              color: "#faf9f6",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#19191c";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#a77769";
            }}
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/collections"
            className="font-body inline-flex h-12 items-center rounded-full border px-8 text-sm tracking-wide transition-all duration-300"
            style={{
              borderColor: "rgba(25,25,28,0.18)",
              color: "#19191c",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#a77769";
              el.style.color = "#a77769";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(25,25,28,0.18)";
              el.style.color = "#19191c";
            }}
          >
            Voir les collections
          </Link>
        </motion.div>

        {/* Légende de bas de page */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="font-abramo mt-16 text-[0.65rem] uppercase tracking-[0.28em]"
          style={{ color: "rgba(25,25,28,0.22)" }}
        >
          Erreur 404 &nbsp;—&nbsp; Atelier Ylang Créations
        </motion.p>
      </motion.div>
    </div>
  );
}
