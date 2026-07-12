"use client";

import { X } from "lucide-react";
import EmbroideryPreview from "@/components/configurator/EmbroideryPreview";
import { normalizeForFont } from "@/lib/embroidery/normalize";
import { getEmbroideryZoneForFont } from "@/lib/configurator/get-embroidery-zone-for-font";
import type { ConfigurateurEmbroideryFont, ConfigurateurProduct } from "@/types/configurateur-page";

interface EmbroideryStepProps {
  product: ConfigurateurProduct | null;
  texts: string[];
  color: string;
  font: ConfigurateurEmbroideryFont | null;
  embroideryColors: { name: string; hex: string }[];
  embroideryFonts: ConfigurateurEmbroideryFont[];
  onTextChange: (index: number, value: string) => void;
  onAddText: () => void;
  onRemoveText: (index: number) => void;
  onSelectColor: (hex: string) => void;
  onSelectFont: (font: ConfigurateurEmbroideryFont) => void;
}

export default function EmbroideryStep({
  product,
  texts,
  color,
  font,
  embroideryColors,
  embroideryFonts,
  onTextChange,
  onAddText,
  onRemoveText,
  onSelectColor,
  onSelectFont,
}: EmbroideryStepProps) {
  const multiNameEnabled = getEmbroideryZoneForFont(product, font?.id)?.multiNameEnabled !== false;

  return (
    <>
      <div>
        <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>
          Étape 03
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "1.75rem",
            color: "var(--color-ink)",
          }}
        >
          Broderie personnalisée
        </h2>
        <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
          +{((font?.price ?? 0) / 100).toFixed(2)} € · Aperçu immédiat sur le produit
        </p>
      </div>

      {/* Noms à broder */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
            Noms à broder
          </span>
          {multiNameEnabled && (
            <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
              {texts.length} / 3
            </span>
          )}
        </div>

        <div className="space-y-4">
          {texts.map((name, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="relative flex-1" style={{ borderBottom: "var(--rule-soft)" }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    // Noms uniquement : lettres (accents compris), espaces,
                    // apostrophes et tirets — pas de chiffres ni symboles.
                    const sanitized = e.target.value.replace(/[^\p{L}\s'-]/gu, "");
                    onTextChange(index, sanitized.slice(0, 15));
                  }}
                  placeholder={index === 0 ? "Ex : Cara" : index === 1 ? "Ex : Maina" : "Ex : Fayel"}
                  className="w-full bg-transparent py-3 font-body text-base outline-none placeholder:opacity-30"
                  style={{ color: "var(--color-ink)", caretColor: "var(--color-accent)" }}
                  maxLength={15}
                />
                <span
                  className="absolute top-1/2 right-0 -translate-y-1/2 font-body text-xs opacity-50"
                  style={{ color: name.length >= 12 ? "var(--color-accent)" : "var(--color-ink-3)" }}
                >
                  {name.length}/15
                </span>
              </div>
              {texts.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveText(index)}
                  className="transition-opacity hover:opacity-50"
                  style={{ color: "var(--color-ink-3)" }}
                  aria-label="Supprimer ce nom"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
        </div>

        {multiNameEnabled && texts.length < 3 && texts[texts.length - 1].length > 0 && (
          <button
            type="button"
            onClick={onAddText}
            className="mt-4 font-body text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--color-ink-3)", borderBottom: "1px solid var(--color-accent)" }}
          >
            + Ajouter un nom
          </button>
        )}

        <p className="mt-4 font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
          Aperçu en temps réel sur l&apos;image ci-dessus
        </p>
      </div>

      {/* Couleur du fil — masqué pour les polices multicolores natives (ex: Alfabeto Liz) */}
      {font?.supportsThreadColor !== false && (
        <div style={{ borderTop: "var(--rule-soft)", paddingTop: "1.5rem" }}>
          <div className="mb-4 flex items-center justify-between">
            <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
              Couleur du fil
            </span>
            {color && (
              <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                {embroideryColors.find((c) => c.hex === color)?.name}
              </span>
            )}
          </div>
          <div className="grid grid-cols-6 gap-4 sm:grid-cols-8 md:grid-cols-10">
            {embroideryColors.map((c) => {
              const isSelected = color === c.hex;
              return (
                <button
                  key={c.hex}
                  onClick={() => onSelectColor(c.hex)}
                  className={`relative h-10 w-10 shrink-0 rounded-full transition-all duration-200 ${
                    isSelected ? "scale-110" : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: c.hex,
                    outline: isSelected ? "2px solid var(--color-accent)" : "none",
                    outlineOffset: "2px",
                  }}
                  title={c.name}
                >
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-white">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Police de broderie */}
      {embroideryFonts.length > 1 && (
        <div style={{ borderTop: "var(--rule-soft)", paddingTop: "1.5rem" }}>
          <div className="mb-4 flex items-center justify-between">
            <span className="type-overline" style={{ color: "var(--color-ink-3)" }}>
              Police de broderie
            </span>
            {font && (
              <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                {font.name}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {embroideryFonts.map((f) => {
              const isSelected = font?.id === f.id;
              const sampleText = normalizeForFont("Ylang", f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onSelectFont(f)}
                  className="flex flex-col items-center gap-2 p-4 transition-all"
                  style={{
                    border: isSelected ? "2px solid var(--color-accent)" : "var(--rule-soft)",
                    background: isSelected ? "var(--color-paper-2)" : "var(--color-paper)",
                  }}
                >
                  <EmbroideryPreview
                    text={sampleText}
                    threadColor={color}
                    targetHeight={48}
                    fontId={f.id}
                    fontFolder={`/fonts/${f.folder}`}
                    fontFormat={f.format}
                    supportsThreadColor={f.supportsThreadColor}
                  />
                  <span className="font-body text-xs" style={{ color: "var(--color-ink)" }}>
                    {f.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
