import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Comment personnaliser — Ylang Créations",
  description: "Découvrez comment personnaliser vos créations textiles pour un cadeau unique et mémorable.",
};

const steps = [
  {
    n: "01",
    title: "Choisissez votre article",
    description:
      "Parcourez nos collections et sélectionnez l'article que vous souhaitez personnaliser (gigoteuse, couverture, protège carnet, etc.).",
  },
  {
    n: "02",
    title: "Sélectionnez vos tissus",
    description:
      "Choisissez parmi notre sélection de gazes de coton, tissus motifs et doublures premium pour créer votre harmonie parfaite.",
  },
  {
    n: "03",
    title: "Ajoutez une broderie",
    description:
      "Indiquez le prénom ou le mot doux à broder. Choisissez la police et la couleur du fil pour une touche personnelle.",
  },
  {
    n: "04",
    title: "Nous confectionnons",
    description:
      "Dès validation, notre atelier artisanal à la Réunion lance la confection de votre pièce unique avec le plus grand soin.",
  },
];

export default function CustomizationPage() {
  return (
    <div className="space-y-16">

      <div>
        <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
          Processus de personnalisation
        </p>
        <h2
          className="mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-title)",
            fontWeight: 400,
            color: "var(--color-ink)",
          }}
        >
          Créer une pièce qui vous ressemble
        </h2>
        <p className="font-body text-base leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
          Chez Ylang Créations, chaque pièce est unique. Voici les étapes pour créer un article à votre image.
        </p>
      </div>

      {/* Étapes */}
      <div>
        {steps.map((step) => (
          <div
            key={step.n}
            className="grid gap-4 py-8 sm:grid-cols-[56px_1fr]"
            style={{ borderTop: "var(--rule-soft)" }}
          >
            <span
              className="font-body text-sm font-medium shrink-0"
              style={{ color: "var(--color-accent)" }}
            >
              {step.n}
            </span>
            <div>
              <h3 className="mb-2 font-body font-medium" style={{ color: "var(--color-ink)" }}>
                {step.title}
              </h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
        <div style={{ borderTop: "var(--rule-soft)" }} />
      </div>

      {/* CTA sur mesure */}
      <div
        className="py-12 px-8 lg:px-12"
        style={{ background: "var(--color-paper-2)", borderTop: "var(--rule-hair)", borderBottom: "var(--rule-hair)" }}
      >
        <p className="type-overline mb-4" style={{ color: "var(--color-accent)" }}>
          Projet hors catalogue
        </p>
        <h3
          className="mb-3"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-title)",
            fontWeight: 400,
            color: "var(--color-ink)",
          }}
        >
          Besoin d'une création sur mesure ?
        </h3>
        <p className="font-body text-sm leading-relaxed mb-8" style={{ color: "var(--color-ink-3)" }}>
          Si vous ne trouvez pas votre bonheur dans notre configurateur, nous pouvons réaliser des projets spécifiques hors catalogue.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/configurateur">
            <Button variant="luxury" size="lg">Ouvrir le configurateur</Button>
          </Link>
          <Link href="/contact">
            <Button variant="secondary" size="lg">Nous contacter</Button>
          </Link>
        </div>
      </div>

    </div>
  );
}
