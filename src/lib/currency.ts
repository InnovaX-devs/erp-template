export const USD_RATE = Number(process.env.NEXT_PUBLIC_USD_RATE ?? 1000);

export type Moneda = "ARS" | "USD";

export function toArs(value: number, moneda: Moneda): number {
  return moneda === "USD" ? value * USD_RATE : value;
}

export function toUsd(value: number, moneda: Moneda): number {
  return moneda === "USD" ? value : value / USD_RATE;
}

export function formatCurrency(value: number, currency: Moneda) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "ARS" ? 0 : 2,
  }).format(value);
}