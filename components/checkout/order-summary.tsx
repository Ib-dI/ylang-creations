import type { CartItem } from "@/types/cart";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  shipping: number;
  finalPrice: number;
  freeShippingThreshold: number;
}

export function OrderSummary({
  items,
  totalPrice,
  shipping,
  finalPrice,
  freeShippingThreshold,
}: OrderSummaryProps) {
  return (
    <div style={{ background: "var(--color-paper)", border: "var(--rule-soft)" }} className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <ShoppingBag className="h-5 w-5" style={{ color: "var(--color-accent)" }} strokeWidth={1.5} />
        <h2
          className="font-display text-xl font-bold"
          style={{ color: "var(--color-ink)" }}
        >
          Récapitulatif ({items.length} article
          {items.length > 1 ? "s" : ""})
        </h2>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4"
            style={{ background: "var(--color-paper-2)" }}
          >
            {/* Thumbnail */}
            <div
              className="h-20 w-20 shrink-0 overflow-hidden"
              style={{ background: "var(--color-paper)" }}
            >
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.productName}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-3xl">🛏️</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3
                className="font-display font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                {item.productName}
              </h3>
              <p className="text-xs" style={{ color: "var(--color-ink-3)" }}>
                Tissu: {item.configuration.fabricName}
              </p>
              {item.configuration.size && (
                <p className="text-xs" style={{ color: "var(--color-ink-3)" }}>
                  Taille: {item.configuration.size}
                </p>
              )}
              {item.configuration.selectedColor && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: item.configuration.selectedColor }}
                  />
                  <span className="text-xs" style={{ color: "var(--color-ink-3)" }}>
                    {item.configuration.selectedColorName ?? item.configuration.selectedColor}
                  </span>
                </div>
              )}
              {item.configuration.embroidery && (
                <p className="text-xs" style={{ color: "var(--color-ink-3)" }}>
                  Broderie: &quot;{item.configuration.embroidery}&quot;
                </p>
              )}
              {item.configuration.embroidery && item.configuration.embroideryFont && (
                <p className="text-xs" style={{ color: "var(--color-ink-3)" }}>
                  Police: {item.configuration.embroideryFont}
                </p>
              )}
              {item.configuration.embroidery && item.configuration.embroideryColor && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: item.configuration.embroideryColor }}
                  />
                  <span className="text-xs" style={{ color: "var(--color-ink-3)" }}>
                    Fil: {item.configuration.embroideryColorName ?? item.configuration.embroideryColor}
                  </span>
                </div>
              )}
              <p className="text-xs" style={{ color: "var(--color-ink-3)" }}>
                Qté: {item.quantity}
              </p>
            </div>

            {/* Price */}
            <div className="text-right">
              <p
                className="font-display text-lg font-bold"
                style={{ color: "var(--color-accent)" }}
              >
                {(item.price * item.quantity).toFixed(2)}€
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totaux */}
      <div className="mt-6 space-y-3 pt-6" style={{ borderTop: "var(--rule-soft)" }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--color-ink-3)" }}>Sous-total</span>
          <span className="font-medium" style={{ color: "var(--color-ink)" }}>
            {totalPrice.toFixed(2)}€
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--color-ink-3)" }}>Livraison</span>
          <span className="font-medium" style={{ color: "var(--color-ink)" }}>
            {shipping === 0 ? (
              <span style={{ color: "var(--color-accent-green)" }}>Offerte</span>
            ) : (
              `${shipping.toFixed(2)}€`
            )}
          </span>
        </div>
        {totalPrice < freeShippingThreshold && (
          <p className="text-xs" style={{ color: "var(--color-ink-3)" }}>
            Plus que {(freeShippingThreshold - totalPrice).toFixed(2)}€ pour
            la livraison offerte
          </p>
        )}

        <div className="flex justify-between pt-3" style={{ borderTop: "var(--rule-soft)" }}>
          <span
            className="font-display font-bold"
            style={{ color: "var(--color-ink)" }}
          >
            Total TTC
          </span>
          <span
            className="font-display text-2xl font-bold"
            style={{ color: "var(--color-accent)" }}
          >
            {finalPrice.toFixed(2)}€
          </span>
        </div>
      </div>
    </div>
  );
}
