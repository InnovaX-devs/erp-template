"use client";

import { Search } from "lucide-react";
import DateInput from "@/components/ui/date-input";
import { CAMPO_OPTIONS, ORIGEN_OPTIONS } from "@/lib/historial-precio-labels";

export type HistorialFiltrosState = {
  producto: string;
  campo: string;
  origen: string;
  fechaDesde: string;
  fechaHasta: string;
};

type Props = {
  filtros: HistorialFiltrosState;
  onChange: (filtros: HistorialFiltrosState) => void;
};

export function HistorialFiltros({ filtros, onChange }: Props) {
  function set<K extends keyof HistorialFiltrosState>(key: K, value: string) {
    onChange({ ...filtros, [key]: value });
  }

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-1">
        <label className="block text-xs font-medium text-[#45464f]">Producto</label>
        <div className="relative mt-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#45464f]" />
          <input
            type="text"
            value={filtros.producto}
            onChange={(e) => set("producto", e.target.value)}
            placeholder="Nombre del producto..."
            className="w-full rounded-lg border border-[#c5c6d0] bg-white py-2 pl-9 pr-3 text-sm text-[#191c1e] placeholder:text-[#45464f] focus:outline-none focus:ring-1 focus:ring-[#021541]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#45464f]">Campo</label>
        <select
          value={filtros.campo}
          onChange={(e) => set("campo", e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#021541]"
        >
          <option value="">Todos</option>
          {CAMPO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#45464f]">Origen</label>
        <select
          value={filtros.origen}
          onChange={(e) => set("origen", e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#021541]"
        >
          <option value="">Todos</option>
          {ORIGEN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#45464f]">Desde</label>
        <DateInput
          value={filtros.fechaDesde}
          max={filtros.fechaHasta || undefined}
          onChange={(valor) => set("fechaDesde", valor)}
          className="mt-1 w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#021541]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#45464f]">Hasta</label>
        <DateInput
          value={filtros.fechaHasta}
          min={filtros.fechaDesde || undefined}
          onChange={(valor) => set("fechaHasta", valor)}
          className="mt-1 w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#021541]"
        />
      </div>
    </div>
  );
}