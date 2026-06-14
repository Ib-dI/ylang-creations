export function centsToEuros(cents: number): number {
  return cents / 100;
}

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export function formatPrice(cents: number): string {
  return euroFormatter.format(centsToEuros(cents));
}
