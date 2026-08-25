"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import {
  FILTROS_INICIALES,
  buildPdfQueryString,
  type PdfFiltros,
  type TipoDocumentoPdf,
} from "@/types/pdf-filtros";

interface Categoria { id: string; nombre: string; }

interface PdfGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DOCUMENTO_OPTIONS: { value: TipoDocumentoPdf; label: string }[] = [
  { value: "LISTA_GENERAL", label: "Lista de precios (Minorista)" },
  { value: "LISTA_MAYORISTA", label: "Lista de precios (Mayorista)" },
  { value: "CATALOGO", label: "Catálogo (Minorista)" },
  { value: "CATALOGO_MAYORISTA", label: "Catálogo (Mayorista)" },
  { value: "CATALOGO_DECANTS", label: "Catálogo de decants" },
];

function ToggleGroup<T extends string>({
  value,
  options,
  onChange,
  columns = 2,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div className="mt-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
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
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [generando, setGenerando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAuxiliares = useCallback(async () => {
    try {
      const resCategorias = await fetch("/api/categorias");
      if (resCategorias.ok) {
        const data = await resCategorias.json();
        setCategorias(Array.isArray(data) ? data : data.items || []);
      }
    } catch (err) {
      console.error("Error al obtener categorías:", err);
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

  function toggleCategoriaExcluida(id: string) {
    setFiltros((prev) => ({
      ...prev,
      categoriasExcluidas: prev.categoriasExcluidas.includes(id)
        ? prev.categoriasExcluidas.filter((c) => c !== id)
        : [...prev.categoriasExcluidas, id],
    }));
  }

    async function handleGenerar() {
    setErrorMsg(null);
    setGenerando(true);

    try {
      const qs = buildPdfQueryString(filtros);
      const res = await fetch(`/api/productos/pdf?${qs}`);

      if (!res.ok) {
        // Caso esperado: el backend avisa "no hay productos con estos
        // filtros". No es una excepción real, así que no la lanzamos ni la
        // logueamos como error — solo mostramos el mensaje en el modal.
        let mensaje = "No se pudo generar el PDF. Intentá de nuevo.";
        try {
          const data = await res.json();
          if (data?.error) mensaje = data.error;
        } catch {
          // si no vino JSON, nos quedamos con el mensaje genérico
        }
        setErrorMsg(mensaje);
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const disposition = res.headers.get("content-disposition") ?? "";
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] ?? "documento.pdf";

      window.open(blobUrl, "_blank", "noopener,noreferrer");

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);

      onClose();
    } catch (err) {

      console.error("Error al generar PDF:", err);
      setErrorMsg("No se pudo generar el PDF. Intentá de nuevo.");
    } finally {
      setGenerando(false);
    }
  }

  const esDecants = filtros.tipoDocumento === "CATALOGO_DECANTS";

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
              value={filtros.tipoDocumento}
              onChange={(v) => set("tipoDocumento", v)}
              options={DOCUMENTO_OPTIONS}
              columns={1}
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

                    {categorias.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-text-dim">Ocultar categorías</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {categorias.map((c) => {
                  const excluida = filtros.categoriasExcluidas.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategoriaExcluida(c.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        excluida
                          ? "border-danger/40 bg-danger/10 text-danger line-through"
                          : "border-border text-text-dim hover:bg-surface-hover"
                      }`}
                    >
                      {c.nombre}
                    </button>
                  );
                })}

                {/* Chip especial: no viene de la API de categorías, representa
                    a los productos con categoriaId = null */}
                {(() => {
                  const excluida = filtros.categoriasExcluidas.includes("SIN_CATEGORIA");
                  return (
                    <button
                      type="button"
                      onClick={() => toggleCategoriaExcluida("SIN_CATEGORIA")}
                      className={`rounded-full border px-3 py-1 text-xs font-medium italic ${
                        excluida
                          ? "border-danger/40 bg-danger/10 text-danger line-through"
                          : "border-border text-text-dim hover:bg-surface-hover"
                      }`}
                    >
                      Sin categoría
                    </button>
                  );
                })()}
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