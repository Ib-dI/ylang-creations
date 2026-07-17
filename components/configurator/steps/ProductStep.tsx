"use client";

import { useState } from "react";
import { Check, ChevronRight, Palette, X } from "lucide-react";
import type { ConfigurateurProduct } from "@/types/configurateur-page";

// Variante plus foncée de --color-accent (oklch 58%), utilisée pour le texte
// afin d'atteindre le contraste AA (--color-accent seul échoue en dessous de 4.5:1).
const ACCENT_TEXT = "oklch(42% 0.070 28)";

interface ProductStepProps {
  products: ConfigurateurProduct[];
  productColors: { name: string; hex: string }[];
  selectedProduct: ConfigurateurProduct | null;
  selectedSize: string | null;
  selectedColor: string | null;
  onSelectProduct: (product: ConfigurateurProduct) => void;
  onSelectSize: (size: string) => void;
  onSelectColor: (hex: string) => void;
}

export default function ProductStep({
  products,
  productColors,
  selectedProduct,
  selectedSize,
  selectedColor,
  onSelectProduct,
  onSelectSize,
  onSelectColor,
}: ProductStepProps) {
  const [showColorBubble, setShowColorBubble] = useState(false);
  const productNeedsSize = !!selectedProduct?.sizes?.length;

  return (
    <>
      <div>
        <p className="type-overline mb-2" style={{ color: ACCENT_TEXT }}>
          Étape 01
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "1.75rem",
            color: "var(--color-ink)",
          }}
        >
          Choisissez votre produit
        </h2>
        <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
          Sélectionnez le produit à personnaliser
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {products.map((product) => {
          const isSelected = selectedProduct?.id === product.id;
          return (
            <button
              key={product.id}
              onClick={() => {
                onSelectProduct(product);
                if (product.colorMaskImage) setShowColorBubble(true);
              }}
              className={`w-full text-left transition-all duration-200 ${
                isSelected ? "" : "bg-[var(--color-paper)] hover:bg-[var(--color-paper-2)] hover:shadow-[var(--shadow-card)]"
              }`}
              style={{
                border: isSelected ? "2px solid var(--color-accent)" : "var(--rule-hair)",
                ...(isSelected ? { background: "var(--color-paper-2)" } : {}),
              }}
            >
              {/* Ligne principale */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="shrink-0 text-lg leading-none">{product.icon}</span>
                <div className="min-w-0 flex-1">
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "1rem",
                      color: "var(--color-ink)",
                      lineHeight: 1.2,
                    }}
                  >
                    {product.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: "var(--text-caption)",
                      color: ACCENT_TEXT,
                      marginTop: "0.125rem",
                    }}
                  >
                    {product.basePrice / 100} €
                  </p>
                </div>
                {isSelected ? (
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center"
                    style={{ background: "var(--color-accent)" }}
                  >
                    <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                  </div>
                ) : (
                  <ChevronRight
                    className="h-4 w-4 shrink-0"
                    style={{ color: "var(--color-ink-3)" }}
                    strokeWidth={1.5}
                  />
                )}
              </div>

              {/* Couleur — apparaît uniquement si sélectionné et colorMask */}
              {isSelected && product.colorMaskImage && selectedColor && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorBubble(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-70"
                  style={{ borderTop: "var(--rule-soft)" }}
                >
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                    {productColors.find((c) => c.hex === selectedColor)?.name}
                  </span>
                  <span
                    className="ml-auto font-body text-xs"
                    style={{ color: ACCENT_TEXT, borderBottom: `1px solid ${ACCENT_TEXT}` }}
                  >
                    Modifier
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Taille */}
      {selectedProduct?.sizes && selectedProduct.sizes.length > 0 && (
        <div className="p-5" style={{ background: "var(--color-paper-2)" }}>
          <div className="mb-3 flex items-center justify-between">
            <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
              Taille
            </span>
            {selectedSize && (
              <span className="font-body text-sm" style={{ color: ACCENT_TEXT }}>
                {selectedSize}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedProduct.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onSelectSize(size)}
                className="font-body px-4 py-2 text-sm transition-opacity hover:opacity-70"
                style={{
                  border: selectedSize === size ? "2px solid var(--color-accent)" : "var(--rule-soft)",
                  color: selectedSize === size ? ACCENT_TEXT : "var(--color-ink)",
                }}
              >
                {size}
              </button>
            ))}
          </div>
          {productNeedsSize && !selectedSize && (
            <p className="font-body mt-2 text-xs" style={{ color: ACCENT_TEXT }}>
              Veuillez sélectionner une taille pour continuer
            </p>
          )}
        </div>
      )}

      {/* Bulle couleur produit */}
      {showColorBubble && selectedProduct?.colorMaskImage && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowColorBubble(false)} />
          <div
            className="fixed bottom-24 left-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden"
            style={{
              background: "var(--color-paper)",
              border: "var(--rule-hair)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ background: "var(--color-paper-2)", borderBottom: "var(--rule-hair)" }}
            >
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
                  Couleur de l&apos;élément
                </span>
              </div>
              <button
                onClick={() => setShowColorBubble(false)}
                className="transition-opacity hover:opacity-50"
                style={{ color: "var(--color-ink-3)" }}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-3">
                {productColors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => {
                      onSelectColor(color.hex);
                      setShowColorBubble(false);
                    }}
                    className={`relative h-10 w-10 rounded-full border-2 border-white transition-all duration-200 ${
                      selectedColor === color.hex ? "scale-110 shadow-md" : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: color.hex,
                      outline: selectedColor === color.hex ? "2px solid var(--color-accent)" : "none",
                      outlineOffset: "2px",
                    }}
                    title={color.name}
                  >
                    {selectedColor === color.hex && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full">
                        <Check className="h-4 w-4 text-white drop-shadow-sm" strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
