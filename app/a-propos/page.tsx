"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MapPin, Scissors } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const timeline = [
  {
    year: "2019",
    title: "Naissance à Mayotte",
    description:
      "Ylang Créations voit le jour à Mayotte, devenant la première entreprise du territoire spécialisée dans la puériculture et la confection textile sur mesure.",
  },
  {
    year: "2019–2024",
    title: "6 années d'expertise",
    description:
      "Développement du savoir-faire artisanal et création de centaines de pièces uniques pour les familles de l'île aux parfums.",
  },
  {
    year: "2025",
    title: "Cap vers la Réunion",
    description:
      "Forte de son expertise, la marque s'installe à la Réunion pour conquérir de nouveaux horizons tout en préservant son identité artisanale.",
  },
];

const values = [
  {
    title: "Fait avec amour",
    description:
      "Chaque création est inspirée par le quotidien d'une maman de 4 enfants. L'amour maternel guide chaque point de couture.",
  },
  {
    title: "Artisanat français",
    description:
      "Entièrement fait main dans notre atelier, chaque pièce est unique et confectionnée avec le plus grand soin.",
  },
  {
    title: "Éco-responsable",
    description:
      "Nous privilégions des tissus certifiés Oeko-Tex et coton bio, garantis sans substances nocives pour la santé.",
  },
  {
    title: "Qualité premium",
    description:
      "Sélection rigoureuse des matières premières pour vous garantir des créations durables et de haute qualité.",
  },
];

const stats = [
  { value: "2019", label: "Fondée en" },
  { value: "6+", label: "Années d'expertise" },
  { value: "100%", label: "Fait main" },
  { value: "∞", label: "Créations uniques" },
];

export default function AProposPage() {
  const [aboutImage, setAboutImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.aboutImage) setAboutImage(data.aboutImage);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ background: "var(--color-paper)" }}>

      {/* Hero */}
      <section className="py-24 lg:py-36" style={{ borderBottom: "var(--rule-hair)" }}>
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeInUp} className="type-overline mb-8" style={{ color: "var(--color-accent)" }}>
              Notre Histoire
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="mb-8"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-display)",
                fontWeight: 400,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
              }}
            >
              Élégance, raffinement
              <br />
              <span style={{ color: "var(--color-accent)" }}>& personnalisation</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="font-body mx-auto max-w-2xl text-lg"
              style={{ color: "var(--color-ink-3)" }}
            >
              Ylang Créations vous propose des services premium de confection textile,
              de décoration d'intérieur et d'aménagement personnalisés.
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="font-abramo-script mt-8 text-3xl"
              style={{ color: "var(--color-accent)" }}
            >
              Avec amour, Mélissa
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div
                className="relative aspect-4/5 overflow-hidden"
                style={{ background: "var(--color-paper-2)" }}
              >
                {aboutImage ? (
                  <Image
                    src={aboutImage}
                    alt="Mélissa, fondatrice de Ylang Créations"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Scissors
                        className="mx-auto mb-4 h-12 w-12"
                        style={{ color: "var(--color-accent)" }}
                        strokeWidth={1}
                      />
                      <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                        Mélissa · Fondatrice
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div>
                <p className="type-overline mb-6" style={{ color: "var(--color-accent)" }}>
                  L'histoire d'Ylang
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-headline)",
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: "var(--color-ink)",
                  }}
                >
                  Une passion née du quotidien maternel
                </h2>
              </div>

              <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
                <p>
                  <strong style={{ color: "var(--color-ink)" }}>Ylang Créations</strong> est une
                  marque française fondée en 2019, spécialisée dans la création et la confection
                  d'articles de puériculture pour bébé et parents.
                </p>
                <p>
                  Une entreprise dont chaque création est inspirée par le quotidien d'une{" "}
                  <strong style={{ color: "var(--color-ink)" }}>maman de 4 enfants</strong>.
                  "Ylang", un hommage aux aïeux de sa fondatrice et "Créations" pour de multiples
                  confections totalement uniques.
                </p>
                <p>
                  Créée à <strong style={{ color: "var(--color-ink)" }}>Mayotte</strong>, Ylang
                  Créations fût la première entreprise du territoire spécialisée dans la
                  puériculture, proposant une offre de confection textile sur mesure et
                  personnalisée.
                </p>
                <p>
                  Après 6 années passées sur l'île et forte de ses compétences et de son
                  savoir-faire, l'entreprise poursuit son activité à la conquête d'un nouveau
                  territoire :{" "}
                  <strong style={{ color: "var(--color-accent)" }}>l'île de la Réunion</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
                <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                  Mayotte → La Réunion
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Parcours */}
      <section
        className="py-24 lg:py-32"
        style={{ background: "var(--color-paper-2)", borderTop: "var(--rule-hair)", borderBottom: "var(--rule-hair)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-20">
            <p className="type-overline mb-6" style={{ color: "var(--color-accent)" }}>
              Notre parcours
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
              }}
            >
              Une aventure humaine
            </h2>
          </div>

          <div>
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="grid gap-6 py-10 lg:grid-cols-[200px_1fr]"
                style={{ borderTop: "var(--rule-soft)" }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-title)",
                    fontWeight: 400,
                    color: "var(--color-accent)",
                  }}
                >
                  {item.year}
                </p>
                <div>
                  <h3 className="mb-2 font-body font-medium" style={{ color: "var(--color-ink)" }}>
                    {item.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
            <div style={{ borderTop: "var(--rule-soft)" }} />
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section id="engagements" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-20">
            <p className="type-overline mb-6" style={{ color: "var(--color-accent)" }}>
              Nos engagements
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-headline)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "var(--color-ink)",
              }}
            >
              Nos valeurs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="py-8 sm:px-8"
                style={{
                  borderTop: "var(--rule-soft)",
                  borderLeft: index % 2 === 1 ? "var(--rule-soft)" : undefined,
                }}
              >
                <h3 className="mb-3 font-body font-medium" style={{ color: "var(--color-ink)" }}>
                  {value.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
                  {value.description}
                </p>
              </motion.div>
            ))}
            <div className="col-span-full" style={{ borderTop: "var(--rule-soft)" }} />
          </div>
        </div>
      </section>

      {/* Oeko-Tex + Stats */}
      <section
        className="py-24 lg:py-32"
        style={{ background: "var(--color-paper-2)", borderTop: "var(--rule-hair)", borderBottom: "var(--rule-hair)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-start gap-20 lg:grid-cols-2">

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <p className="type-overline" style={{ color: "var(--color-accent)" }}>
                Démarche éco-responsable
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-headline)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  color: "var(--color-ink)",
                }}
              >
                Certification Oeko-Tex
              </h2>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
                <p>
                  Nous privilégions des tissus garantis{" "}
                  <strong style={{ color: "var(--color-ink)" }}>100% Oeko-Tex</strong> et en{" "}
                  <strong style={{ color: "var(--color-ink)" }}>coton bio</strong>.
                </p>
                <p>
                  <strong style={{ color: "var(--color-ink)" }}>C'est quoi Oeko-Tex ?</strong>
                  <br />
                  C'est la certification attribuée aux produits qui ne présentent, lors du contrôle,
                  aucune substance chimique ou nocive pour la santé.
                </p>
              </div>
              <div className="pt-6" style={{ borderTop: "var(--rule-soft)" }}>
                <h3 className="mb-3 font-body font-medium" style={{ color: "var(--color-ink)" }}>
                  Pourquoi choisir Ylang Créations ?
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
                  Nous choisir, c'est la garantie de s'offrir des produits sains, de qualité
                  premium, à notre image et qui respectent l'environnement.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2"
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="px-8 py-10 text-center"
                  style={{
                    borderTop: index >= 2 ? "var(--rule-soft)" : undefined,
                    borderLeft: index % 2 === 1 ? "var(--rule-soft)" : undefined,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-headline)",
                      fontWeight: 400,
                      color: "var(--color-accent)",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="mt-2 font-body text-xs uppercase tracking-wider"
                    style={{ color: "var(--color-ink-3)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Concept */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <p className="type-overline mb-6" style={{ color: "var(--color-accent)" }}>
                Notre concept
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-headline)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  color: "var(--color-ink)",
                }}
              >
                Partager notre savoir-faire
              </h2>
            </div>
            <p className="font-body mx-auto max-w-2xl text-base leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
              Vous nous confiez vos projets, vos envies et vos attentes. En sélectionnant avec le
              plus grand soin nos matières premières, nous vous garantissons des créations de
              qualité, artisanales et entièrement fait main.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              <Link href="/collections">
                <Button variant="secondary" size="lg">Découvrir nos créations</Button>
              </Link>
              <Link href="/configurateur">
                <Button variant="luxury" size="lg">Créer sur mesure</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Contact */}
      <section
        className="py-20"
        style={{ background: "var(--color-paper-2)", borderTop: "var(--rule-hair)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="mb-2 font-body text-base font-medium" style={{ color: "var(--color-ink)" }}>
              Une question ? Un projet ?
            </p>
            <p className="font-body mb-8 text-sm" style={{ color: "var(--color-ink-3)" }}>
              N'hésitez pas à nous contacter pour discuter de votre projet personnalisé.
            </p>
            <Link href="/contact">
              <Button variant="luxury" size="lg">Nous contacter</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
