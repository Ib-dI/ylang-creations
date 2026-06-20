"use client";

import Link from "next/link";
import { Palette, Wand2, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: Palette,
    title: "Choisissez votre produit",
    description:
      "Parcourez notre collection et sélectionnez le produit qui vous correspond : gigoteuse, tour de lit, doudou, décoration...",
    features: [
      "Large choix de produits",
      "Toutes les tailles disponibles",
      "Conseils personnalisés",
    ],
  },
  {
    number: "02",
    icon: Wand2,
    title: "Personnalisez à l'infini",
    description:
      "Utilisez notre configurateur intuitif pour choisir vos tissus, couleurs, broderies et options. Visualisez en temps réel votre création.",
    features: [
      "Bibliothèque de 200+ tissus",
      "Broderie sur mesure",
      "Aperçu instantané",
    ],
  },
  {
    number: "03",
    icon: Package,
    title: "Recevez votre création",
    description:
      "Votre pièce unique est confectionnée à la main dans notre atelier et livrée avec soin dans un emballage premium.",
    features: [
      "Confection sous 7-10 jours",
      "Livraison soignée",
      "Garantie satisfait ou remboursé",
    ],
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding overflow-hidden" style={{ background: "var(--color-paper)" }}>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center animate-fade-in-up">
          <p
            className="mb-3 text-xs tracking-[0.2em] uppercase font-semibold"
            style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
          >
            Simple et intuitif
          </p>
          <h2 className="font-display text-ylang-charcoal/81 mb-6 text-3xl lg:text-5xl font-semibold tracking-tight">
            Comment ça marche ?
          </h2>
          <p className="font-body text-ylang-charcoal/60 mx-auto max-w-2xl text-md">
            Créez votre produit unique en 3 étapes simples. Notre configurateur
            vous guide à chaque instant.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-16 grid gap-8 lg:grid-cols-3 lg:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${0.2 + index * 0.2}s` }}
              >
                {/* Card */}
                <div
                  className="relative h-full aspect-4/5 p-8"
                  style={{ background: "var(--color-paper-2)", border: "var(--rule-hair)" }}
                >
                  {/* Number Badge */}
                  <div
                    className="absolute -top-4 -right-4 flex h-16 w-16 items-center justify-center"
                    style={{ background: "var(--color-ink)" }}
                  >
                    <span
                      className="text-2xl font-semibold"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 flex h-16 w-16 items-center justify-center">
                    <Icon className="h-8 w-8" style={{ color: "var(--color-accent)" }} />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-ylang-charcoal mb-4 text-2xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="font-body text-ylang-charcoal/70 mb-6 text-md leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="text-ylang-rose mt-0.5 h-5 w-5 shrink-0" />
                        <span className="font-body text-ylang-charcoal/60 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div 
          className="text-center animate-fade-in-up"
          style={{ animationDelay: '0.8s' }}
        >
          <Button variant="luxury" size="xl" className="group" asChild>
            <Link href="/configurateur">
              <Wand2 className="mr-2 h-5 w-5" />
              Commencer ma création
            </Link>
          </Button>
          
        </div>
      </div>

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