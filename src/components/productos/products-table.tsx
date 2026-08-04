"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";
import type { ProductoDTO } from "@/types/producto";

type ProductsTableProps = {
  items: ProductoDTO[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

function calcGananciaPct(costo: number, venta: number) {
  if (costo === 0) return 0;
  return ((venta - costo) / costo) * 100;
}

export function ProductsTable({
  items,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
}: ProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-text-dim">
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Costo</th>
              <th className="px-4 py-3 font-medium">Venta</th>
              <th className="px-4 py-3 font-medium">% Ganancia</th>
              <th className="px-4 py-3 font-medium">Mayorista</th>
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
                  No se encontraron productos.
                </td>
              </tr>
            )}

            {!isLoading &&
              items.map((producto) => {
                const gananciaPct = calcGananciaPct(producto.precioCosto, producto.precioVenta);
                const moneda = producto.monedaPrecio;

                return (
                  <tr
                    key={producto.id}
                    className="border-b border-border/60 last:border-0 hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3 font-medium text-text">{producto.nombre}</td>
                    <td className="px-4 py-3 text-text-dim">{producto.marca?.nombre ?? "—"}</td>
                    <td className="px-4 py-3 text-text">{producto.stockActual}</td>
                    <td className="px-4 py-3 text-text">
                      {formatCurrency(producto.precioCosto, moneda)}
                    </td>
                    <td className="px-4 py-3 text-text">
                      {formatCurrency(producto.precioVenta, moneda)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 font-medium",
                        gananciaPct >= 0 ? "text-success" : "text-danger"
                      )}
                    >
                      {gananciaPct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-text">
                      {producto.precioMayorista != null
                        ? formatCurrency(producto.precioMayorista, moneda)
                        : "—"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-dim">
        <span>
          {total} producto{total === 1 ? "" : "s"}
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