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

export function PdfGeneratorModal({ isOpen, onClose }: PdfGeneratorModalProps) {
  const [filtros, setFiltros] = useState<PdfFiltros>(FILTROS_INICIALES);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

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

  function handleGenerar() {
    const qs = buildPdfQueryString(filtros);
    window.open(`/api/productos/pdf?${qs}`, "_blank", "noopener,noreferrer");
    onClose();
  }

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

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-dim">Documento</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => set("documento", "LISTA")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  filtros.documento === "LISTA"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-dim hover:bg-surface-hover"
                }`}
              >
                Lista de precios
              </button>
              <button
                type="button"
                onClick={() => set("documento", "CATALOGO")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  filtros.documento === "CATALOGO"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-dim hover:bg-surface-hover"
                }`}
              >
                Catálogo
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
            <input
              type="checkbox"
              checked={filtros.conImagenes}
              onChange={(e) => set("conImagenes", e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Incluir imágenes de los productos
          </label>

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

          <div>
            <label className="block text-xs font-medium text-text-dim">
              Rango de precio (moneda cargada de cada producto)
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

          <div>
            <label className="block text-xs font-medium text-text-dim">Tipo de precio</label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => set("tipoPrecio", "MINORISTA")}
                className={`rounded-lg border px-2 py-2 text-xs font-medium sm:text-sm ${
                  filtros.tipoPrecio === "MINORISTA"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-dim hover:bg-surface-hover"
                }`}
              >
                Minorista
              </button>
              <button
                type="button"
                onClick={() => set("tipoPrecio", "MAYORISTA")}
                className={`rounded-lg border px-2 py-2 text-xs font-medium sm:text-sm ${
                  filtros.tipoPrecio === "MAYORISTA"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-dim hover:bg-surface-hover"
                }`}
              >
                Mayorista
              </button>
              <button
                type="button"
                onClick={() => set("tipoPrecio", "AMBOS")}
                className={`rounded-lg border px-2 py-2 text-xs font-medium sm:text-sm ${
                  filtros.tipoPrecio === "AMBOS"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-dim hover:bg-surface-hover"
                }`}
              >
                Ambos
              </button>
            </div>
            {filtros.tipoPrecio === "MAYORISTA" && (
              <p className="mt-1 text-xs text-text-dim">
                Solo se incluyen productos con precio mayorista cargado.
              </p>
            )}
            {filtros.tipoPrecio === "AMBOS" && (
              <p className="mt-1 text-xs text-text-dim">
                Se muestran ambos precios. Los productos sin mayorista cargado
                se listan igual, con ese valor vacío.
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
            <input
              type="checkbox"
              checked={filtros.soloDecant}
              onChange={(e) => set("soloDecant", e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Solo productos que se venden por decant
          </label>
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
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
}