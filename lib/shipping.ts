import { euros, type Euros } from "@/lib/currency";

const COLISSIMO_TIERS: Array<{ maxGrams: number; priceEur: number }> = [
  { maxGrams: 250, priceEur: 5.49 },
  { maxGrams: 500, priceEur: 7.59 },
  { maxGrams: 750, priceEur: 9.29 },
  { maxGrams: 1000, priceEur: 9.59 },
  { maxGrams: 2000, priceEur: 11.19 },
  { maxGrams: 5000, priceEur: 17.39 },
  { maxGrams: 10000, priceEur: 25.29 },
];

const COLISSIMO_MAX_PRICE_EUR = euros(39.59);

export const FALLBACK_SHIPPING_EUR = euros(9.59);

export function calculateShippingRate(weightGrams: number): Euros {
  const tier = COLISSIMO_TIERS.find((t) => weightGrams <= t.maxGrams);
  return tier ? euros(tier.priceEur) : COLISSIMO_MAX_PRICE_EUR;
}
