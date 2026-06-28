import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entretien des produits — Ylang Créations",
  description: "Conseils pour prendre soin de vos créations Ylang et assurer leur longévité.",
};

const tips = [
  {
    label: "Lavage",
    title: "Doux à 30°C",
    detail: "Lavage en machine à 30°C maximum en cycle délicat pour préserver les fibres et les couleurs.",
  },
  {
    label: "Séchage",
    title: "À l'air libre",
    detail: "Privilégiez le séchage à plat à l'air libre. Le sèche-linge est déconseillé pour la gaze de coton.",
  },
  {
    label: "Repassage",
    title: "Fer doux",
    detail: "Repassage à fer doux si nécessaire. La gaze de coton gagne en douceur et en aspect gaufré sans repassage.",
  },
  {
    label: "Blanchiment",
    title: "Interdit",
    detail: "L'utilisation de chlore ou de produits blanchissants est strictement interdite.",
  },
];

const materials = [
  {
    title: "Double gaze de coton",
    detail:
      "La gaze de coton s'adoucit au fil des lavages. Elle n'a pas besoin d'être repassée pour garder son bel aspect froissé naturel.",
  },
  {
    title: "Broderies",
    detail:
      "Pour protéger les broderies personnalisées, nous recommandons de laver l'article sur l'envers ou dans un filet de protection.",
  },
  {
    title: "Articles avec ouatine",
    detail:
      "Pour les gigoteuses et couvertures, redonnez du gonflant après lavage en secouant doucement l'article avant de le faire sécher.",
  },
];

export default function MaintenancePage() {
  return (
    <div className="space-y-16">

      {/* Instructions générales */}
      <section>
        <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
          Instructions de lavage
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
          Prendre soin de vos créations
        </h2>
        <p className="font-body text-base leading-relaxed mb-8" style={{ color: "var(--color-ink-3)" }}>
          Nos produits sont confectionnés avec des tissus délicats. Voici nos conseils pour les garder beaux et doux longtemps.
        </p>

        <div>
          {tips.map((tip) => (
            <div
              key={tip.label}
              className="grid gap-3 py-5 sm:grid-cols-[120px_120px_1fr]"
              style={{ borderTop: "var(--rule-soft)" }}
            >
              <p
                className="font-body text-xs uppercase tracking-wider"
                style={{ color: "var(--color-ink-3)" }}
              >
                {tip.label}
              </p>
              <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                {tip.title}
              </p>
              <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                {tip.detail}
              </p>
            </div>
          ))}
          <div style={{ borderTop: "var(--rule-soft)" }} />
        </div>
      </section>

      {/* Par matière */}
      <section style={{ borderTop: "var(--rule-hair)", paddingTop: "4rem" }}>
        <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
          Conseils par matière
        </p>
        <h2
          className="mb-8"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-title)",
            fontWeight: 400,
            color: "var(--color-ink)",
          }}
        >
          Spécificités des matériaux
        </h2>
        <div>
          {materials.map((m) => (
            <div
              key={m.title}
              className="py-6"
              style={{ borderTop: "var(--rule-soft)" }}
            >
              <p className="font-body text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
                {m.title}
              </p>
              <p className="font-body text-sm leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
                {m.detail}
              </p>
            </div>
          ))}
          <div style={{ borderTop: "var(--rule-soft)" }} />
        </div>
      </section>

    </div>
  );
}
