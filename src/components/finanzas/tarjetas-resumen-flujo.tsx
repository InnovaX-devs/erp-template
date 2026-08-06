"use client";

import { formatCurrency } from "@/lib/currency";

interface Resumen {
  saldoTotal: number;
  totalEfectivo: number;
  totalTransferencia: number;
  ingresosPeriodo: number;
  egresosPeriodo: number;
  netoPeriodo: number;
}

export function TarjetasResumenFlujo({ resumen }: { resumen: Resumen }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tarjeta label="Saldo total" valor={resumen.saldoTotal} />
        <Tarjeta label="Efectivo" valor={resumen.totalEfectivo} colorTexto="text-success" />
        <Tarjeta label="Transferencia" valor={resumen.totalTransferencia} colorTexto="text-primary" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tarjeta
          label="Ingresos del período"
          valor={resumen.ingresosPeriodo}
          prefijo="+"
          colorTexto="text-success"
          fondo="bg-success/10"
        />
        <Tarjeta
          label="Egresos del período"
          valor={resumen.egresosPeriodo}
          prefijo="-"
          colorTexto="text-danger"
          fondo="bg-danger/10"
        />
        <Tarjeta
          label="Neto del período"
          valor={resumen.netoPeriodo}
          prefijo={resumen.netoPeriodo >= 0 ? "+" : ""}
          colorTexto={resumen.netoPeriodo >= 0 ? "text-success" : "text-danger"}
        />
      </div>
    </div>
  );
}

function Tarjeta({
  label,
  valor,
  prefijo = "",
  colorTexto = "text-text",
  fondo = "bg-surface",
}: {
  label: string;
  valor: number;
  prefijo?: string;
  colorTexto?: string;
  fondo?: string;
}) {
  return (
    <div className={`rounded-xl border border-border ${fondo} p-4`}>
      <span className="text-xs font-medium uppercase tracking-wider text-text-dim">{label}</span>
      <p className={`mt-1 text-2xl font-bold ${colorTexto}`}>
        {prefijo}
        {formatCurrency(Math.abs(valor), "ARS")}
      </p>
    </div>
  );
}