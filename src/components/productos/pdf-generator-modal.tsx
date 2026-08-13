"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import {
  FILTROS_INICIALES,
  buildPdfQueryString,
  type PdfFiltros,
} from "@/types/pdf-filtros";

interface Marca { id: string; nombre: string; }
interface Categoria { id: string; nombre: string; }

interface PdfGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ToggleGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className={`mt-1 grid gap-2`} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((op) => (
        <button
          key={op.value}
          type="button"
          onClick={() => onChange(op.value)}
          className={`rounded-lg border px-2 py-2 text-xs font-medium sm:text-sm ${
            value === op.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-text-dim hover:bg-surface-hover"
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}

export function PdfGeneratorModal({ isOpen, onClose }: PdfGeneratorModalProps) {
  const [filtros, setFiltros] = useState<PdfFiltros>(FILTROS_INICIALES);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [generando, setGenerando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAuxiliares = useCallback(async () => {
    try {
      const [resMarcas, resCategorias] = await Promise.all([
        fetch("/api/marcas"),
        fetch("/api/categorias"),
      ]);
      if (resMarcas.ok) {
        const data = await resMarcas.json();
        setMarcas(Array.isArray(data) ? data : data.items || []);
      }
      if (resCategorias.ok) {
        const data = await resCategorias.json();
        setCategorias(Array.isArray(data) ? data : data.items || []);
      }
    } catch (err) {
      console.error("Error al obtener marcas o categorías:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAuxiliares();
      setFiltros(FILTROS_INICIALES);
    }
  }, [isOpen, fetchAuxiliares]);

  if (!isOpen) return null;

  function set<K extends keyof PdfFiltros>(key: K, value: PdfFiltros[K]) {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerar() {
    setErrorMsg(null);
    setGenerando(true);

    try {
      const qs = buildPdfQueryString(filtros);
      const res = await fetch(`/api/productos/pdf?${qs}`);

      if (!res.ok) {
        throw new Error("No se pudo generar el PDF.");
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Filename real que armó el servidor (Content-Disposition)
      const disposition = res.headers.get("content-disposition") ?? "";
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] ?? "documento.pdf";

      // 1) Abrir en pestaña nueva para visualizarlo
      window.open(blobUrl, "_blank", "noopener,noreferrer");

      // 2) Disparar la descarga automática del mismo archivo
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Libera la memoria del blob después de un rato (le da tiempo a
      // la pestaña nueva y a la descarga de terminar de usarlo)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);

      onClose();
    } catch (err) {
      console.error("Error al generar PDF:", err);
      setErrorMsg("No se pudo generar el PDF. Intentá de nuevo.");
    } finally {
      setGenerando(false);
    }
  }

  const esDecants = filtros.tipoProducto === "DECANTS";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
            <FileText className="h-5 w-5" />
            Generar PDF
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-dim hover:bg-surface-hover hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {errorMsg}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-dim">Documento</label>
            <ToggleGroup
              value={filtros.documento}
              onChange={(v) => set("documento", v)}
              options={[
                { value: "LISTA", label: "Lista de precios" },
                { value: "CATALOGO", label: "Catálogo" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-dim">Tipo de producto</label>
            <ToggleGroup
              value={filtros.tipoProducto}
              onChange={(v) => set("tipoProducto", v)}
              options={[
                { value: "PERFUMES", label: "Perfumes" },
                { value: "VAPERS", label: "Vapers" },
                { value: "DECANTS", label: "Decants" },
              ]}
            />
            {esDecants && (
              <p className="mt-1 text-xs text-text-dim">
                Se muestra el precio de decant (5ml y 10ml) en vez del precio de botella completa.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-dim">Moneda</label>
            <ToggleGroup
              value={filtros.moneda}
              onChange={(v) => set("moneda", v)}
              options={[
                { value: "ARS", label: "Pesos (ARS)" },
                { value: "USD", label: "Dólares (USD)" },
              ]}
            />
          </div>

          {!esDecants && (
            <div>
              <label className="block text-xs font-medium text-text-dim">Tipo de precio</label>
              <ToggleGroup
                value={filtros.tipoPrecio}
                onChange={(v) => set("tipoPrecio", v)}
                options={[
                  { value: "MINORISTA", label: "Minorista" },
                  { value: "MAYORISTA", label: "Mayorista" },
                  { value: "AMBOS", label: "Ambos" },
                ]}
              />
              {filtros.tipoPrecio === "MAYORISTA" && (
                <p className="mt-1 text-xs text-text-dim">
                  Solo se incluyen productos con precio mayorista cargado.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-dim">Buscar por nombre</label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => set("busqueda", e.target.value)}
              placeholder="Ej: Bleu de Chanel"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-dim">Marca</label>
              <select
                value={filtros.marcaId}
                onChange={(e) => set("marcaId", e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                <option value="">Todas</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-dim">Categoría</label>
              <select
                value={filtros.categoriaId}
                onChange={(e) => set("categoriaId", e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                <option value="">Todas</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {!esDecants && (
            <div>
              <label className="block text-xs font-medium text-text-dim">
                Rango de precio (en la moneda seleccionada arriba)
              </label>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Mínimo"
                  value={filtros.precioMin}
                  onChange={(e) => set("precioMin", e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Máximo"
                  value={filtros.precioMax}
                  onChange={(e) => set("precioMax", e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-dim hover:bg-surface-hover"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGenerar}
            disabled={generando}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {generando ? "Generando..." : "Generar PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}