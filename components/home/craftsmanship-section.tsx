"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Scissors, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

const stats = [
  { number: "1500+", label: "Créations uniques" },
  { number: "6 ans", label: "D'expertise" },
  { number: "4.9/5", label: "Satisfaction clients" },
  { number: "100%", label: "Made in France" },
];

interface CraftsmanshipSectionProps {
  craftsmanshipImage?: string;
}

export function CraftsmanshipSection({ craftsmanshipImage = "/images/atelier.png" }: CraftsmanshipSectionProps) {

  return (
    <section className="section-padding overflow-hidden" style={{ background: "var(--color-paper-2)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center animate-fade-in-up">
          <p
            className="mb-3 text-[11px] tracking-[0.2em] uppercase font-semibold"
            style={{ fontFamily: "var(--font-brand)", color: "var(--color-accent)" }}
          >
            Excellence artisanale
          </p>
          <h2 className="font-display text-ylang-charcoal mb-6 text-4xl lg:text-5xl font-semibold tracking-tight">
            Un savoir-faire d'exception
          </h2>
          <p className="font-body text-ylang-charcoal/60 mx-auto max-w-3xl text-lg leading-relaxed">
            Depuis notre atelier Mahorais/Réunion, nous créons des pièces
            textiles uniques alliant tradition artisanale et innovation. Chaque
            création est le fruit d'un travail minutieux et passionné.
          </p>
        </div>

        {/* Content Grid */}
        <div className="mb-20 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Images Atelier */}
          <div 
            className="relative animate-slide-in-left"
            style={{ animationDelay: '0.2s' }}
          >
            {/* Image principale */}
            <div className="relative aspect-4/5 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--color-paper-3)" }}>
                <Image
                  src={craftsmanshipImage}
                  alt="Atelier Ylang Créations"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={85}
                  className="object-cover"
                />
              </div>
            </div>

          </div>

          {/* Texte & Valeurs */}
          <div 
            className="space-y-8 animate-slide-in-right"
            style={{ animationDelay: '0.3s' }}
          >
            <div>
              <h3
                className="font-semibold mb-4 text-3xl tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
              >
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
              {values.map((value) => (
                <div
                  key={value.title}
                  className="flex gap-4 p-4"
                  style={{ borderBottom: "var(--rule-hair)" }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                    <value.icon className="h-6 w-6" style={{ color: "var(--color-accent)" }} />
                  </div>
                  <div>
                    <h4 className="font-display text-ylang-charcoal mb-1 text-base font-semibold tracking-tight">
                      {value.title}
                    </h4>
                    <p className="font-body text-ylang-charcoal/60 text-sm">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div 
              className="animate-fade-in-up"
              style={{ animationDelay: '1s' }}
            >
              <Button variant="secondary" size="lg" className="group " asChild>
                <Link href="/a-propos">
                  Découvrir notre histoire
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className="grid grid-cols-2 gap-8 p-8 md:grid-cols-4"
          style={{ borderTop: "var(--rule-hair)" }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="mb-2 text-4xl font-semibold lg:text-5xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-accent)" }}
              >
                {stat.number}
              </p>
              <p className="font-body text-ylang-charcoal/60 text-sm">
                {stat.label}
              </p>
            </div>
          ))}
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

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out both;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out both;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out both;
        }

        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out both;
        }
      `}</style>
    </section>
  );
}