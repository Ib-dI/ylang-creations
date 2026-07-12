"use client";

import { motion } from "framer-motion";
import type { ConfigurateurEmbroideryFont, ConfigurateurFabric, ConfigurateurProduct } from "@/types/configurateur-page";

interface SummaryStepProps {
  product: ConfigurateurProduct;
  fabric: ConfigurateurFabric;
  size: string | null;
  selectedColor: string | null;
  productColors: { name: string; hex: string }[];
  embroideries: string[];
  embroideryColor: string;
  embroideryColors: { name: string; hex: string }[];
  embroideryFont: ConfigurateurEmbroideryFont | null;
  totalPriceCents: number;
}

export default function SummaryStep({
  product,
  fabric,
  size,
  selectedColor,
  productColors,
  embroideries,
  embroideryColor,
  embroideryColors,
  embroideryFont,
  totalPriceCents,
}: SummaryStepProps) {
  const hasEmbroidery = embroideries.some((e) => e);
  const embroideryShowsColor = embroideryFont?.supportsThreadColor !== false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5"
    >
      <div>
        <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>
          Étape 04
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "1.75rem",
            color: "var(--color-ink)",
          }}
        >
          Votre création
        </h2>
        <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
          Vérifiez avant d&apos;ajouter au panier
        </p>
      </div>

      {/* Carte de configuration */}
      <div style={{ border: "var(--rule-soft)" }}>
        {/* Produit */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          className="flex items-start justify-between px-5 py-4"
          style={{ borderBottom: "var(--rule-soft)" }}
        >
          <div>
            <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>Produit</p>
            <p className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              {product.name}
            </p>
            {size && (
              <p className="font-body mt-0.5 text-xs" style={{ color: "var(--color-ink-3)" }}>
                Taille {size}
              </p>
            )}
          </div>
          <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
            {product.basePrice / 100} €
          </span>
        </motion.div>

        {/* Tissu */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.14 }}
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "var(--rule-soft)" }}
        >
          <div>
            <p className="type-overline mb-2" style={{ color: "var(--color-ink-3)" }}>Tissu</p>
            <div className="flex items-center gap-2.5">
              {fabric.image && (
                <div
                  className="h-8 w-8 shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${fabric.image}')`, border: "var(--rule-soft)" }}
                />
              )}
              <span className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                {fabric.name}
              </span>
            </div>
          </div>
          {fabric.price > 0 ? (
            <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
              +{fabric.price / 100} €
            </span>
          ) : (
            <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>Inclus</span>
          )}
        </motion.div>

        {/* Couleur produit */}
        {selectedColor && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "var(--rule-soft)" }}
          >
            <div>
              <p className="type-overline mb-2" style={{ color: "var(--color-ink-3)" }}>Couleur</p>
              <div className="flex items-center gap-2.5">
                <div
                  className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="font-body text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                  {productColors.find((c) => c.hex === selectedColor)?.name ?? selectedColor}
                </span>
              </div>
            </div>
            <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>Inclus</span>
          </motion.div>
        )}

        {/* Broderie */}
        {hasEmbroidery ? (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 }}
            className="flex items-center justify-between px-5 py-4"
          >
            <div>
              <p className="type-overline mb-2" style={{ color: "var(--color-ink-3)" }}>Broderie</p>
              <div className="flex items-center gap-2.5">
                {embroideryShowsColor && (
                  <div
                    className="h-6 w-6 shrink-0 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: embroideryColor }}
                  />
                )}
                <div>
                  {embroideries.filter(Boolean).map((name, i) => (
                    <p
                      key={i}
                      className="leading-tight"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 400,
                        fontSize: "1.5rem",
                        color: "var(--color-ink)",
                      }}
                    >
                      {name}
                    </p>
                  ))}
                  <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
                    {embroideryShowsColor
                      ? [embroideryFont?.name, embroideryColors.find((c) => c.hex === embroideryColor)?.name]
                          .filter(Boolean)
                          .join(" · ")
                      : embroideryFont?.name}
                  </p>
                </div>
              </div>
            </div>
            <span className="font-body text-sm" style={{ color: "var(--color-ink)" }}>
              +{((embroideryFont?.price ?? 0) / 100).toFixed(2)} €
            </span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 }}
            className="px-5 py-4"
          >
            <p className="type-overline mb-1" style={{ color: "var(--color-ink-3)" }}>Broderie</p>
            <p className="font-body text-xs italic" style={{ color: "var(--color-ink-3)", opacity: 0.5 }}>
              Aucune broderie
            </p>
          </motion.div>
        )}
      </div>

      {/* Total */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="flex items-center justify-between px-6 py-5"
        style={{ background: "var(--color-paper-2)", border: "var(--rule-hair)" }}
      >
        <div>
          <p className="type-overline mb-0.5" style={{ color: "var(--color-ink-3)" }}>Total</p>
          <p className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
            Livraison calculée au checkout
          </p>
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "var(--text-headline)",
            color: "var(--color-accent)",
            lineHeight: 1,
          }}
        >
          {totalPriceCents / 100} €
        </span>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.36 }}
        className="grid grid-cols-3 gap-2"
      >
        {["Fait main", "Tissu certifié", "Expédié sous 7j"].map((badge) => (
          <div key={badge} className="py-3 text-center" style={{ border: "var(--rule-soft)" }}>
            <span className="type-overline block mb-0.5" style={{ color: "var(--color-accent)" }}>✦</span>
            <span className="font-body text-xs" style={{ color: "var(--color-ink-3)" }}>
              {badge}
            </span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
