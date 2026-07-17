"use client";

import type { ConfigurateurProduct } from "@/types/configurateur-page";

// Variante plus foncée de --color-accent (oklch 58%), utilisée pour le texte
// afin d'atteindre le contraste AA (--color-accent seul échoue en dessous de 4.5:1).
const ACCENT_TEXT = "oklch(42% 0.070 28)";

interface ProductMarketingSectionProps {
  product: ConfigurateurProduct;
  products: ConfigurateurProduct[];
  onSelectProduct: (product: ConfigurateurProduct) => void;
}

export default function ProductMarketingSection({ product, products, onSelectProduct }: ProductMarketingSectionProps) {
  const similarProducts = products.filter((p) => p.id !== product.id);

  return (
    <div className="px-6 py-20 sm:px-12 lg:px-20" style={{ background: "var(--color-paper-3)" }}>
      <div className="mx-auto max-w-6xl">
        {/* Description */}
        <div className="mb-24 grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Visuel */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm overflow-hidden" style={{ background: "var(--color-paper)" }}>
              <img src={product.baseImage} alt={product.name} className="h-auto w-full object-contain" />
              <div
                className="absolute top-5 left-5 px-3 py-1.5"
                style={{ background: "var(--color-ink-2)", border: "var(--rule-hair)" }}
              >
                <p className="type-overline" style={{ color: ACCENT_TEXT }}>
                  100% Personnalisable
                </p>
              </div>
            </div>
          </div>

          {/* Texte */}
          <div className="flex flex-col justify-center">
            <p className="type-overline mb-3" style={{ color: ACCENT_TEXT }}>
              Création artisanale
            </p>
            <h2
              className="mb-4"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "var(--text-headline)",
                color: "var(--color-ink)",
              }}
            >
              {product.name}
            </h2>

            {product.description && (
              <p className="font-body mb-10 leading-relaxed text-sm" style={{ color: "var(--color-ink-3)" }}>
                {product.description}
              </p>
            )}

            {/* Specs */}
            <div className="mb-10 grid grid-cols-2 gap-3">
              <div className="p-4" style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }}>
                <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>Prix de base</p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "var(--text-title)",
                    color: ACCENT_TEXT,
                  }}
                >
                  {(product.basePrice / 100).toFixed(2)} €
                </p>
              </div>
              {product.weight > 0 && (
                <div className="p-4" style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }}>
                  <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>Poids</p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "var(--text-title)",
                      color: "var(--color-ink)",
                    }}
                  >
                    {product.weight} g
                  </p>
                </div>
              )}
            </div>

            {/* Points clés */}
            <ul className="space-y-3.5">
              {[
                "Fabriqué à la main avec soin",
                "Tissu de votre choix parmi notre collection",
                "Broderie personnalisée optionnelle",
                "Livraison soignée dans un emballage cadeau",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="font-body mt-0.5 shrink-0 text-sm" style={{ color: ACCENT_TEXT }}>
                    ✓
                  </span>
                  <span className="font-body text-sm" style={{ color: "var(--color-ink-3)" }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Produits similaires */}
        {similarProducts.length > 0 && (
          <div style={{ borderTop: "var(--rule-soft)", paddingTop: "4rem" }}>
            <div className="mb-10">
              <p className="type-overline mb-3" style={{ color: ACCENT_TEXT }}>
                Découvrir aussi
              </p>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "var(--text-title)",
                  color: "var(--color-ink)",
                }}
              >
                Produits similaires
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {similarProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group text-left transition-opacity hover:opacity-70"
                >
                  <div className="mb-3 aspect-square w-full overflow-hidden" style={{ background: "var(--color-paper)" }}>
                    <img
                      src={p.baseImage}
                      alt={p.name}
                      className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p
                    className="mb-0.5"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "1.125rem",
                      color: "var(--color-ink)",
                    }}
                  >
                    {p.name}
                  </p>
                  <p className="font-body text-xs" style={{ color: ACCENT_TEXT }}>
                    À partir de {(p.basePrice / 100).toFixed(2)} €
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
