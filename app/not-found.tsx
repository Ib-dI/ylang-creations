"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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

function CornerMark({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
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
          stroke="rgba(25,25,28,0.22)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

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
        stroke="rgba(25,25,28,0.15)"
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay, duration: 2.2, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

export default function NotFound() {
  return (
    <div
      className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 py-20"
      style={{
        background: "var(--color-paper)",
        backgroundImage: `
          linear-gradient(rgba(25,25,28,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(25,25,28,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "44px 44px",
      }}
    >
      <CornerMark position="tl" />
      <CornerMark position="tr" />
      <CornerMark position="bl" />
      <CornerMark position="br" />

      <motion.div
        className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(25,25,28,0.04) 0%, transparent 65%)",
        }}
        animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(25,25,28,0.03) 0%, transparent 65%)",
        }}
        animate={{ x: [0, -16, 0], y: [0, 16, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

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

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-lg flex-col items-center text-center"
      >
        {/* Étiquette de marque */}
        <motion.div variants={fadeUp} className="mb-10 flex items-center gap-3">
          <span className="h-px w-10" style={{ background: "var(--color-ink-3)", opacity: 0.3 }} />
          <span
            className="font-abramo text-xs uppercase tracking-[0.32em]"
            style={{ color: "var(--color-ink-3)" }}
          >
            Ylang Créations
          </span>
          <span className="h-px w-10" style={{ background: "var(--color-ink-3)", opacity: 0.3 }} />
        </motion.div>

        {/* 404 */}
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
              transition={{ delay, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="font-abramo-script leading-none select-none"
              style={{
                fontSize: "clamp(7rem, 20vw, 15rem)",
                color: i === 1 ? "var(--color-ink)" : "rgba(25,25,28,0.22)",
                lineHeight: 0.9,
              }}
            >
              {digit}
            </motion.span>
          ))}

          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5, ease: "backOut" }}
            className="absolute -top-2 -right-5 text-2xl"
            style={{ color: "var(--color-ink-3)" }}
          >
            ✦
          </motion.span>
        </div>

        {/* Séparateur */}
        <motion.div variants={fadeUp} className="my-8 flex w-full items-center gap-4">
          <span className="h-px flex-1" style={{ background: "rgba(25,25,28,0.12)" }} />
          <span
            style={{
              color: "var(--color-ink-3)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
            }}
          >
            PAGE INTROUVABLE
          </span>
          <span className="h-px flex-1" style={{ background: "rgba(25,25,28,0.12)" }} />
        </motion.div>

        {/* Titre */}
        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "1.75rem",
            color: "var(--color-ink)",
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
          }}
        >
          Cette page s&apos;est effilochée
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="font-body mb-10 max-w-md text-sm leading-relaxed"
          style={{ color: "var(--color-ink-3)" }}
        >
          Le fil qui vous a mené ici ne conduit nulle part. La page recherchée a
          peut-être été déplacée ou n&apos;existe plus dans notre collection.
        </motion.p>

        {/* Boutons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="/"
            className="font-body inline-flex h-12 items-center px-8 text-sm tracking-wide transition-opacity duration-200 hover:opacity-80"
            style={{
              background: "var(--color-ink)",
              color: "var(--color-paper)",
            }}
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/collections"
            className="font-body inline-flex h-12 items-center border px-8 text-sm tracking-wide transition-all duration-200"
            style={{
              borderColor: "var(--rule-soft)",
              color: "var(--color-ink)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-ink)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--rule-soft)";
            }}
          >
            Voir les collections
          </Link>
        </motion.div>

        {/* Légende */}
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
