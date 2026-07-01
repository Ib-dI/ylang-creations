export type Cents = number & { _brand: "Cents" };
export type Euros = number & { _brand: "Euros" };

export const cents = (n: number): Cents => n as Cents;
export const euros = (n: number): Euros => n as Euros;

export function centsToEuros(n: Cents): Euros {
  return (n / 100) as Euros;
}

export function eurosToCents(n: Euros): Cents {
  return Math.round(n * 100) as Cents;
}

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export function formatPrice(n: Cents): string {
  return euroFormatter.format(n / 100);
}

export function formatEuros(n: Euros): string {
  return euroFormatter.format(n);
}
