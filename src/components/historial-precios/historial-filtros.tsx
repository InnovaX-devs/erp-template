"use client";

import { Search } from "lucide-react";
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
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-1">
        <label className="block text-xs font-medium text-text-dim">Producto</label>
        <div className="relative mt-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            value={filtros.producto}
            onChange={(e) => set("producto", e.target.value)}
            placeholder="Nombre del producto..."
            className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-dim">Campo</label>
        <select
          value={filtros.campo}
          onChange={(e) => set("campo", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
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
        <label className="block text-xs font-medium text-text-dim">Origen</label>
        <select
          value={filtros.origen}
          onChange={(e) => set("origen", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
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
        <label className="block text-xs font-medium text-text-dim">Desde</label>
        <input
          type="date"
          value={filtros.fechaDesde}
          onChange={(e) => set("fechaDesde", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-dim">Hasta</label>
        <input
          type="date"
          value={filtros.fechaHasta}
          onChange={(e) => set("fechaHasta", e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}