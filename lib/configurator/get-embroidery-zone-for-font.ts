import type { ConfigurateurProduct, EmbroideryZone } from "@/types/configurateur-page";

// Resolves which calibrated EmbroideryZone a product should use for a given
// font: an exact match if calibrated, else the "moonlight" zone (the first
// font every product was calibrated against), else whatever zone exists.
export function getEmbroideryZoneForFont(
  product: ConfigurateurProduct | null,
  fontId: string | undefined,
): EmbroideryZone | null {
  if (!product?.embroideryZone) return null;
  const zones = product.embroideryZone;
  if (fontId && zones[fontId]) return zones[fontId];
  if (zones.moonlight) return zones.moonlight;
  const first = Object.values(zones)[0];
  return first ?? null;
}
