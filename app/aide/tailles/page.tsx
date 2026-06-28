import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide des Tailles — Ylang Créations",
  description: "Consultez notre guide des tailles pour choisir le produit parfait pour votre bébé.",
};

export default function SizeGuidePage() {
  return (
    <div className="space-y-16">

      {/* Gigoteuses */}
      <section>
        <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
          Gigoteuses & Turbulettes
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
          Choisir la bonne taille
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderTop: "var(--rule-hair)" }}>
            <thead>
              <tr style={{ borderBottom: "var(--rule-soft)" }}>
                <th
                  className="py-3 pr-8 text-left"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400, letterSpacing: "0.12em", fontSize: "0.68rem", textTransform: "uppercase", color: "var(--color-ink-3)" }}
                >
                  Âge
                </th>
                <th
                  className="py-3 pr-8 text-left"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400, letterSpacing: "0.12em", fontSize: "0.68rem", textTransform: "uppercase", color: "var(--color-ink-3)" }}
                >
                  Taille bébé
                </th>
                <th
                  className="py-3 text-left"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400, letterSpacing: "0.12em", fontSize: "0.68rem", textTransform: "uppercase", color: "var(--color-ink-3)" }}
                >
                  Taille gigoteuse
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Naissance – 6 mois", "50 – 68 cm", "70 cm"],
                ["6 mois – 24 mois", "68 – 92 cm", "90 cm"],
                ["24 mois – 36 mois", "92 – 105 cm", "110 cm"],
              ].map(([age, baby, gigo]) => (
                <tr key={age} style={{ borderBottom: "var(--rule-soft)" }}>
                  <td className="py-4 pr-8 font-body text-sm" style={{ color: "var(--color-ink)" }}>{age}</td>
                  <td className="py-4 pr-8 font-body text-sm" style={{ color: "var(--color-ink-3)" }}>{baby}</td>
                  <td className="py-4 font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>{gigo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 font-body text-xs italic" style={{ color: "var(--color-ink-3)" }}>
          Assurez-vous que l'ouverture du cou est bien ajustée pour éviter que bébé ne glisse à l'intérieur.
        </p>
      </section>

      {/* Linge de lit */}
      <section style={{ borderTop: "var(--rule-hair)", paddingTop: "4rem" }}>
        <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
          Linge de lit
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
          Tresses &amp; tours de lit
        </h2>
        <div className="space-y-0">
          {[
            {
              label: "Tresse de lit",
              detail: "Disponibles en 1 m, 2 m, 3 m ou 4 m pour s'adapter à tous les types de berceaux et lits.",
            },
            {
              label: "Tour de lit",
              detail: "Adapté aux lits standard de 60×120 cm ou 70×140 cm.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="grid gap-3 py-5 sm:grid-cols-[160px_1fr]"
              style={{ borderBottom: "var(--rule-soft)" }}
            >
              <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                {item.label}
              </p>
              <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cape de bain */}
      <section style={{ borderTop: "var(--rule-hair)", paddingTop: "4rem" }}>
        <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
          Cape de bain
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
          Formats disponibles
        </h2>
        <div className="space-y-0">
          {[
            {
              size: "S",
              label: "Format Standard — 75×75 cm",
              detail: "Idéal de la naissance jusqu'à 2 ans.",
            },
            {
              size: "L",
              label: "Format Junior — 100×100 cm",
              detail: "Parfait pour les enfants de 2 à 5 ans.",
            },
          ].map((item) => (
            <div
              key={item.size}
              className="flex items-start gap-6 py-5"
              style={{ borderBottom: "var(--rule-soft)" }}
            >
              <span
                className="font-body text-xs font-semibold tracking-wider shrink-0 w-6"
                style={{ color: "var(--color-accent)" }}
              >
                {item.size}
              </span>
              <div>
                <p className="font-body text-sm font-medium mb-0.5" style={{ color: "var(--color-ink)" }}>
                  {item.label}
                </p>
                <p className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
