"use client";

import { useState, useEffect, useRef } from "react";
import { toArs } from "@/lib/currency";
import type { ProductoBusqueda } from "@/types/presupuesto";

export default function BuscadorProducto({
  tipoPrecio,
  onAgregar,
}: {
  tipoPrecio: "MINORISTA" | "MAYORISTA";
  onAgregar: (producto: ProductoBusqueda) => void;
}) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ProductoBusqueda[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResultados([]);
      return;
    }

    const timeout = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setCargando(true);
      try {
        const res = await fetch(`/api/productos/buscar?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResultados(data.items ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error buscando productos:", err);
        }
      } finally {
        setCargando(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  function handleChange(value: string) {
    setQuery(value);
    setAbierto(true);
  }

  function handleSeleccionar(producto: ProductoBusqueda) {
    onAgregar(producto);
    setQuery("");
    setResultados([]);
    setAbierto(false);
  }

  return (
    <div className="relative flex-1">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#021541]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setAbierto(true)}
          placeholder="Buscar producto (incluye productos sin stock)..."
          className="w-full pl-9 pr-3 py-2.5 border-2 border-[#021541] rounded-lg text-sm focus:outline-none"
        />
      </div>

      {abierto && query.trim() && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-[#c5c6d0] rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {cargando && <p className="px-3 py-2 text-sm text-[#45464f]">Buscando...</p>}
          {!cargando && resultados.length === 0 && (
            <p className="px-3 py-2 text-sm text-[#45464f]">Sin resultados.</p>
          )}
          {!cargando &&
            resultados.map((p) => {
              const precioBase = tipoPrecio === "MAYORISTA" ? p.precioMayorista ?? p.precioVenta : p.precioVenta;
              const precio = toArs(precioBase, p.monedaPrecio);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSeleccionar(p)}
                  className="w-full flex justify-between items-center px-3 py-2 text-sm text-left hover:bg-[#f1f5f9]"
                >
                  <span>
                    {p.nombre}
                    {p.marca && <span className="ml-1 text-[#45464f]">— {p.marca.nombre}</span>}
                    {p.stockActual === 0 && (
                      <span className="ml-2 text-[11px] text-[#ba1a1a]">sin stock</span>
                    )}
                  </span>
                  <span className="text-[#45464f]">${precio.toFixed(2)}</span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}