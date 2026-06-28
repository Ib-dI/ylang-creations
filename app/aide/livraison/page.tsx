import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livraison & Retours — Ylang Créations",
  description: "Informations sur les modes de livraison, les frais de port et notre politique de retours.",
};

export default function ShippingPage() {
  return (
    <div className="space-y-16">

      {/* Livraison */}
      <section>
        <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
          Expédition
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
          Modes de livraison
        </h2>
        <div className="space-y-0">
          {[
            {
              label: "France Métropolitaine",
              detail: "Par Colissimo — 48 à 72 h après expédition.",
            },
            {
              label: "La Réunion",
              detail: "Retrait gratuit à l'atelier ou livraison locale.",
            },
            {
              label: "Dom-Tom & International",
              detail: "Livraison via Colissimo International.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="grid gap-3 py-5 sm:grid-cols-[200px_1fr]"
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
        <p className="mt-5 font-body text-xs italic" style={{ color: "var(--color-ink-3)" }}>
          Rappel : comptez 10 à 15 jours de confection pour les articles personnalisés, avant l'expédition.
        </p>
      </section>

      {/* Retours */}
      <section style={{ borderTop: "var(--rule-hair)", paddingTop: "4rem" }}>
        <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
          Retours
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
          Politique de retours
        </h2>
        <div className="space-y-0">
          <div className="py-5" style={{ borderBottom: "var(--rule-soft)" }}>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
              Vous disposez de <strong style={{ color: "var(--color-ink)" }}>14 jours</strong> à compter de la réception pour nous retourner un article s'il ne vous convient pas.
            </p>
          </div>
          <div className="py-5" style={{ borderBottom: "var(--rule-soft)" }}>
            <p className="font-body text-xs uppercase tracking-wider mb-2" style={{ color: "var(--color-ink-3)" }}>
              Exception légale
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
              Conformément à la loi, les produits <strong style={{ color: "var(--color-ink)" }}>personnalisés ou sur mesure</strong> ne peuvent être retournés ou échangés.
            </p>
          </div>
        </div>
      </section>

      {/* Paiement & Click & Collect */}
      <section style={{ borderTop: "var(--rule-hair)", paddingTop: "4rem" }}>
        <p className="type-overline mb-5" style={{ color: "var(--color-accent)" }}>
          Informations pratiques
        </p>
        <div className="space-y-0">
          <div className="py-5" style={{ borderBottom: "var(--rule-soft)" }}>
            <p className="font-body text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
              Paiement sécurisé
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
              Toutes les transactions sur Ylang Créations sont sécurisées via notre partenaire de paiement. Vos informations bancaires ne sont jamais stockées sur nos serveurs.
            </p>
          </div>
          <div className="py-5" style={{ borderBottom: "var(--rule-soft)" }}>
            <p className="font-body text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
              Click &amp; Collect — La Réunion
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--color-ink-3)" }}>
              Si vous habitez à la Réunion, vous pouvez choisir le retrait gratuit à notre atelier (Saint-Denis) lors du passage de votre commande.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
