/**
 * Colissimo shipping rates for 2026
 * Calculated based on total package weight in grams
 */

const COLISSIMO_TIERS: Array<{ maxGrams: number; priceEur: number }> = [
  { maxGrams: 250, priceEur: 5.49 },
  { maxGrams: 500, priceEur: 7.59 },
  { maxGrams: 750, priceEur: 9.29 },
  { maxGrams: 1000, priceEur: 9.59 },
  { maxGrams: 2000, priceEur: 11.19 },
  { maxGrams: 5000, priceEur: 17.39 },
  { maxGrams: 10000, priceEur: 25.29 },
];

const COLISSIMO_MAX_PRICE_EUR = 39.59;

/**
 * Calculates the Colissimo home delivery rate based on package weight.
 *
 * @param weightGrams - Total package weight in grams
 * @returns Shipping cost in EUR
 */
export function calculateShippingRate(weightGrams: number): number {
  const tier = COLISSIMO_TIERS.find((t) => weightGrams <= t.maxGrams);
  return tier?.priceEur ?? COLISSIMO_MAX_PRICE_EUR;
}
