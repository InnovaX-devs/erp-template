"use client";

import { formatCurrency } from "@/lib/currency";

interface Props {
  resumen: {
    totalGastos: number;
    cajaDisponible: number;
  };
}

export function TarjetasResumenGastos({ resumen }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-dim">Total gastos</p>
        <p className="mt-1 text-2xl font-semibold text-text">
          {formatCurrency(resumen.totalGastos, "ARS")}
        </p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-dim">Caja disponible</p>
        <p className="mt-1 text-2xl font-semibold text-text">
          {formatCurrency(resumen.cajaDisponible, "ARS")}
        </p>
      </div>
    </div>
  );
}