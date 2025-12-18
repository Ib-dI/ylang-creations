"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Scissors, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

const values = [
  {
    icon: Scissors,
    title: "Confection artisanale",
    description:
      "Chaque pièce est cousue à la main dans notre atelier parisien avec le plus grand soin",
  },
  {
    icon: Heart,
    title: "Tissus premium",
    description:
      "Sélection rigoureuse de textiles biologiques certifiés GOTS et Oeko-Tex",
  },
  {
    icon: Sparkles,
    title: "Personnalisation illimitée",
    description:
      "Broderies, couleurs, motifs : créez un produit 100% unique qui vous ressemble",
  },
];

export function CraftsmanshipSection() {
  const [craftsmanshipImage, setCraftsmanshipImage] = React.useState(
    "/images/atelier.png",
  );

  React.useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.craftsmanshipImage) {
          setCraftsmanshipImage(data.craftsmanshipImage);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section className="section-padding to-ylang-beige/30 overflow-hidden bg-linear-to-b from-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="font-body text-ylang-rose mb-3 text-sm tracking-widest uppercase">
            Excellence artisanale
          </p>
          <h2 className="font-display text-ylang-charcoal mb-6 text-4xl lg:text-5xl">
            Un savoir-faire d'exception
          </h2>
          <p className="font-body text-ylang-charcoal/60 mx-auto max-w-3xl text-lg leading-relaxed">
            Depuis notre atelier Mahorais/Réunion, nous créons des pièces
            textiles uniques alliant tradition artisanale et innovation. Chaque
            création est le fruit d'un travail minutieux et passionné.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="mb-20 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Images Atelier */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Image principale */}
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl shadow-2xl">
              <div className="from-ylang-beige to-ylang-cream absolute inset-0 flex items-center justify-center bg-linear-to-br">
                <Image
                  src={craftsmanshipImage}
                  alt="Atelier Ylang Créations"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Image flottante secondaire */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -right-8 -bottom-8 hidden aspect-square w-2/5 overflow-hidden rounded-xl border-4 border-white shadow-xl lg:block"
            >
              <div className="bg-ylang-rose/20 absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🧵</span>
              </div>
            </motion.div>

            {/* Badge Made in France */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute top-6 left-6 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇫🇷</span>
                <div>
                  <p className="font-body text-ylang-charcoal/60 text-xs">
                    Fièrement
                  </p>
                  <p className="font-display text-ylang-charcoal text-sm font-semibold">
                    Made in France
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Texte & Valeurs */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-display text-ylang-charcoal mb-4 text-3xl">
                L'excellence au service de vos émotions
              </h3>
              <p className="font-body text-ylang-charcoal/70 mb-4 leading-relaxed">
                Chaque pièce Ylang Créations naît d'une rencontre entre votre
                vision et notre expertise. Nous sélectionnons avec soin les plus
                beaux tissus biologiques et les transformons en créations
                uniques qui accompagneront les moments précieux de votre vie.
              </p>
              <p className="font-body text-ylang-charcoal/70 leading-relaxed">
                Notre atelier Ylang Créations perpétue un savoir-faire
                traditionnel tout en intégrant des techniques modernes de
                personnalisation pour vous offrir une expérience sur mesure
                inégalée.
              </p>
            </div>

            {/* Values Cards */}
            <div className="space-y-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="flex gap-4 rounded-xl bg-white p-4 transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="bg-ylang-rose/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <value.icon className="text-ylang-rose h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display text-ylang-charcoal mb-1 text-lg">
                      {value.title}
                    </h4>
                    <p className="font-body text-ylang-charcoal/60 text-sm">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Button variant="secondary" size="lg" className="group" asChild>
              <Link href="/a-propos">
                Découvrir notre histoire
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 gap-8 rounded-2xl bg-white p-8 shadow-lg md:grid-cols-4"
        >
          {[
            { number: "1500+", label: "Créations uniques" },
            { number: "6 ans", label: "D'expertise" },
            { number: "4.9/5", label: "Satisfaction clients" },
            { number: "100%", label: "Made in France" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-ylang-rose mb-2 text-4xl font-bold lg:text-5xl">
                {stat.number}
              </p>
              <p className="font-body text-ylang-charcoal/60 text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
