"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import type { IngresoPorDia } from "@/types/reporte";

type Metrica = "ingresos" | "ganancia" | "items";

const TABS: { value: Metrica; label: string }[] = [
  { value: "ingresos", label: "Ingresos" },
  { value: "ganancia", label: "Ganancia" },
  { value: "items", label: "Ítems" },
];

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function formatearEtiqueta(fechaISO: string): string {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const d = new Date(anio, mes - 1, dia);
  return `${DIAS_SEMANA[d.getDay()]} ${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`;
}

function valorDe(item: IngresoPorDia, metrica: Metrica): number {
  if (metrica === "ingresos") return item.ingresosARS;
  if (metrica === "ganancia") return item.gananciaARS;
  return item.items;
}

function formatearValor(valor: number, metrica: Metrica): string {
  return metrica === "items" ? valor.toString() : formatCurrency(valor, "ARS");
}

export function IngresosPorDia({ datos }: { datos: IngresoPorDia[] }) {
  const [metrica, setMetrica] = useState<Metrica>("ingresos");

  if (datos.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-[#191c1e]">Ingresos por día</h2>
        <p className="text-sm text-[#45464f]">Sin datos en el período.</p>
      </div>
    );
  }

  const valores = datos.map((d) => valorDe(d, metrica));
  const maximoAbs = Math.max(...valores.map((v) => Math.abs(v)), 1);

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#191c1e]">Ingresos por día</h2>
        <div className="flex gap-1 rounded-lg border border-[#c5c6d0] bg-[#F1F5F9] p-0.5">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setMetrica(t.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                metrica === t.value
                  ? "bg-[#021541] text-white"
                  : "text-[#45464f] hover:bg-[#eceef0] hover:text-[#191c1e]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* h-40 acá es la altura "real" que van a heredar las columnas de abajo */}
      <div className="flex h-40 gap-1.5 overflow-x-auto pb-1">
        {datos.map((item) => {
          const valor = valorDe(item, metrica);
          const alturaPct = Math.max((Math.abs(valor) / maximoAbs) * 100, valor !== 0 ? 3 : 0);
          return (
            <div key={item.fecha} className="flex min-w-[28px] flex-1 flex-col items-center gap-1">
              {/* esta zona sí tiene altura definida (flex-1 dentro de un padre
                  con altura fija), así que el % de la barra ahora funciona */}
              <div className="flex w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t transition-all ${valor < 0 ? "bg-red-500" : "bg-primary"}`}
                  style={{ height: `${alturaPct}%` }}
                  title={formatearValor(valor, metrica)}
                />
              </div>
              <span className="shrink-0 text-[10px] text-[#45464f]">{formatearEtiqueta(item.fecha)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}