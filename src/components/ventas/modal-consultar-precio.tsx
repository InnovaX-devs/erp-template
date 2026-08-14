"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { ProductoBusquedaDTO } from "@/types/producto";
import { formatCurrency, toUsd, toArs } from "@/lib/currency";

interface Props {
  onClose: () => void;
}

export function ModalConsultarPrecio({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ProductoBusquedaDTO[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cotizacionUSD, setCotizacionUSD] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    fetch("/api/configuracion")
      .then((res) => res.json())
      .then((data) => setCotizacionUSD(data.cotizacionUSD ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResultados([]);
      return;
    }
    const controller = new AbortController();
    setCargando(true);

    fetch(`/api/productos/buscar?q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setResultados(data.items ?? []))
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setCargando(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-8 sm:pt-20 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <Search size={18} className="text-text-dim" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar producto por nombre o marca..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
          />
          {cargando && <Loader2 size={16} className="animate-spin text-text-dim" />}
          <button onClick={onClose} className="text-text-dim hover:text-text" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query.trim() && (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-text-dim">
              <Search size={28} className="opacity-40" />
              Escribí para buscar un producto
            </div>
          )}

          {query.trim() && resultados.length === 0 && !cargando && (
            <div className="py-10 text-center text-sm text-text-dim">
              Sin resultados para &quot;{query}&quot;
            </div>
          )}

            {resultados.map((p) => {
                const minoristaUsd = toUsd(p.precioVenta, p.monedaPrecio);
                const mayoristaUsd = p.precioMayorista != null ? toUsd(p.precioMayorista, p.monedaPrecio) : null;

            return (
              <div key={p.id} className="rounded-xl p-3 hover:bg-surface-hover">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-text">
                      {p.nombre}
                      {p.marca && <span className="ml-1 text-text-dim">· {p.marca.nombre}</span>}
                    </p>
                    <p className={`text-xs ${p.stockActual > 0 ? "text-text-dim" : "text-danger"}`}>
                      Stock: {p.stockActual > 0 ? p.stockActual : "Sin stock"}
                    </p>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 xs:grid-cols-2 sm:gap-3">
                  <div className="rounded-lg bg-surface-hover/50 p-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                      Minorista
                    </span>
                    <p className="text-sm font-semibold text-text">{formatCurrency(minoristaUsd, "USD")}</p>
                    <p className="text-xs text-text-dim">
                      {cotizacionUSD > 0 ? formatCurrency(minoristaUsd * cotizacionUSD, "ARS") : "Sin cotización"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-hover/50 p-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                      Mayorista
                    </span>
                    {mayoristaUsd != null ? (
                      <>
                        <p className="text-sm font-semibold text-text">{formatCurrency(mayoristaUsd, "USD")}</p>
                        <p className="text-xs text-text-dim">
                          {cotizacionUSD > 0 ? formatCurrency(mayoristaUsd * cotizacionUSD, "ARS") : "Sin cotización"}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-text-dim">No configurado</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}