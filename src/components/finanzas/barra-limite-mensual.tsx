"use client";

import { formatCurrency } from "@/lib/currency";
import type { TipoCuenta } from "@/types/cuenta";

interface Props {
  saldoActual: number;
  limite: number;
  tipo: TipoCuenta;
}

export function BarraLimiteMensual({ saldoActual, limite, tipo }: Props) {
  const moneda = tipo.endsWith("USD") ? "USD" : "ARS";
  const porcentaje = limite > 0 ? Math.min(100, Math.max(0, (saldoActual / limite) * 100)) : 0;
  const colorBarra = porcentaje >= 90 ? "bg-danger" : porcentaje >= 70 ? "bg-warning" : "bg-success";

  return (
    <div className="mt-2 w-full max-w-[220px]">
      <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-text-dim">
        <span>Límite mensual</span>
        <span>{porcentaje.toFixed(0)}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div className={`h-full rounded-full ${colorBarra}`} style={{ width: `${porcentaje}%` }} />
      </div>
      <div className="mt-0.5 flex justify-between text-[10px] text-text-dim">
        <span>{formatCurrency(saldoActual, moneda)}</span>
        <span>/ {formatCurrency(limite, moneda)}</span>
      </div>
    </div>
  );
}