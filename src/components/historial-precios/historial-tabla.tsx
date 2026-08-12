"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { CAMPO_LABELS, ORIGEN_LABELS } from "@/lib/historial-precio-labels";
import type { HistorialPrecioDTO } from "@/types/historial-precio";

type Props = {
  items: HistorialPrecioDTO[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

function formatFecha(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function HistorialTabla({ items, isLoading, page, totalPages, total, onPageChange }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-text-dim">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Campo</th>
              <th className="px-4 py-3 font-medium">Valor anterior</th>
              <th className="px-4 py-3 font-medium">Valor nuevo</th>
              <th className="px-4 py-3 font-medium">Origen</th>
              <th className="px-4 py-3 font-medium">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60 last:border-0">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-full max-w-[100px] animate-pulse rounded bg-surface-hover" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-dim">
                  No hay registros que coincidan con los filtros.
                </td>
              </tr>
            )}

            {!isLoading &&
              items.map((item) => (
                <tr key={item.id} className="border-b border-border/60 last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-mono text-xs text-text-dim">{formatFecha(item.fecha)}</td>
                  <td className="px-4 py-3 font-medium text-text">{item.producto.nombre}</td>
                  <td className="px-4 py-3 text-text">{CAMPO_LABELS[item.campo] ?? item.campo}</td>
                  <td className="px-4 py-3 text-text-dim">
                    {item.valorAnterior !== null ? item.valorAnterior.toLocaleString("es-AR") : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-text">
                    {item.valorNuevo.toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-text-dim">{ORIGEN_LABELS[item.origen] ?? item.origen}</td>
                  {/* TODO: reemplazar por el usuario real cuando se resuelva
                      autenticación y se agregue usuarioId a HistorialPrecio */}
                  <td className="px-4 py-3 text-text-dim">Sistema</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-dim">
        <span>
          {total} registro{total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-surface-hover disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-surface-hover disabled:opacity-40"
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}