// lib/currency.ts
export type Moneda = "ARS" | "USD";

export function toArs(value: number, moneda: Moneda, cotizacionUSD: number): number {
  return moneda === "USD" ? value * cotizacionUSD : value;
}

export function toUsd(value: number, moneda: Moneda, cotizacionUSD: number): number {
  return moneda === "USD" ? value : value / cotizacionUSD;
}

export function formatCurrency(value: number, currency: Moneda) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "ARS" ? 0 : 2,
  }).format(value);
}