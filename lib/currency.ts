/** Converts a price stored in cents (integer) to euros (float). */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/** Converts a euro price to cents (integer), rounded to avoid floating-point drift. */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/** Formats a cent value as a French locale euro string — e.g. "12,50 €". */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(centsToEuros(cents));
}
