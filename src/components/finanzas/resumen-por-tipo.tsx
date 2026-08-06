"use client";

import type { CuentaDTO } from "@/types/cuenta";
import { formatCurrency } from "@/lib/currency";

interface Props {
  cuentas: CuentaDTO[];
}

const GRUPOS: { titulo: string; tipos: CuentaDTO["tipo"][]; color: string }[] = [
  { titulo: "Efectivo ARS", tipos: ["EFECTIVO_ARS"], color: "bg-success/10 text-success" },
  { titulo: "Efectivo USD", tipos: ["EFECTIVO_USD"], color: "bg-success/10 text-success" },
  { titulo: "Banco ARS", tipos: ["BANCO_ARS"], color: "bg-primary/10 text-primary" },
  { titulo: "Banco USD", tipos: ["BANCO_USD"], color: "bg-primary/10 text-primary" },
];

export function ResumenPorTipo({ cuentas }: Props) {
  const activas = cuentas.filter((c) => c.activa);

  const grupos = GRUPOS.map((g) => ({
    ...g,
    cuentas: activas.filter((c) => g.tipos.includes(c.tipo)),
    total: activas.filter((c) => g.tipos.includes(c.tipo)).reduce((acc, c) => acc + c.saldoActual, 0),
  })).filter((g) => g.cuentas.length > 0);

  if (grupos.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-dim">
        Resumen por tipo de cuenta
      </span>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {grupos.map((g) => (
          <div key={g.titulo} className={`rounded-lg p-3 ${g.color}`}>
            <span className="text-xs font-semibold uppercase tracking-wider">{g.titulo}</span>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(g.total, g.titulo.includes("USD") ? "USD" : "ARS")}
            </p>
            {g.cuentas.length > 1 && (
              <ul className="mt-2 space-y-1">
                {g.cuentas.map((c) => (
                  <li key={c.id} className="flex justify-between text-xs opacity-80">
                    <span>{c.nombre}</span>
                    <span>{formatCurrency(c.saldoActual, g.titulo.includes("USD") ? "USD" : "ARS")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}