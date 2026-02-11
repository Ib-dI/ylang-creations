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
    <section className="section-padding relative overflow-hidden bg-ylang-terracotta/40">
      {/* Décorations d'arrière-plan */}
      <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-ylang-sage/10 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-96 w-96 rounded-full bg-ylang-rose/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center animate-fade-in-up">
          <p className="font-abramo font-semibold text-ylang-rose mb-3 text-sm uppercase tracking-widest">
            Simple et intuitif
          </p>
          <h2 className="font-abramo-script text-ylang-charcoal mb-6 text-3xl lg:text-5xl">
            Comment ça marche ?
          </h2>
          <p className="font-body text-ylang-charcoal/60 mx-auto max-w-2xl text-lg">
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
                {/* Connecting Line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-20 left-full z-0 hidden h-0.5 w-full -translate-x-1/2 bg-linear-to-r from-ylang-rose/50 to-transparent lg:block" />
                )}

                {/* Card */}
                <div className="relative h-full rounded-2xl bg-ylang-yellow p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full bg-ylang-terracotta shadow-lg">
                    <span className="font-display text-2xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-ylang-white transition-transform duration-300 group-hover:scale-110">
                    <Icon className="text-ylang-terracotta h-8 w-8" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-ylang-charcoal mb-4 text-2xl">
                    {step.title}
                  </h3>
                  <p className="font-body text-ylang-charcoal/70 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="text-white mt-0.5 h-5 w-5 shrink-0" />
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
          <p className="font-body text-ylang-charcoal/60 mt-4 text-sm">
            ✨ Aucun engagement • Aperçu gratuit • Paiement sécurisé
          </p>
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