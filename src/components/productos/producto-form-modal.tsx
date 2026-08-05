"use client";

import { useState, useEffect } from "react";

export interface ProductoFormData {
  id?: string;
  nombre: string;
  codigoBarras: string;
  ubicacion: string;
  marcaId: string;
  categoriaId: string;
  stockActual: number | "";
  stockMinimo: number | "";
  destacado: boolean;
  monedaPrecio: "ARS" | "USD";
  precioCosto: number | "";
  precioVenta: number | "";
  precioMayorista: number | "";
  precioOferta: number | "";
  esDecant: boolean;
}

interface Marca {
  id: string;
  nombre: string;
}

interface Categoria {
  id: string;
  nombre: string;
}

interface ProductoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productoEditar?: ProductoFormData | null;
  onSuccess: () => void; 
  marcasIniciales?: Marca[];
  categoriasIniciales?: Categoria[];
}

export function ProductoFormModal({
  isOpen,
  onClose,
  productoEditar,
  onSuccess,
  marcasIniciales = [],
  categoriasIniciales = [],
}: ProductoFormModalProps) {
  // Estado del formulario de producto
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: "",
    codigoBarras: "",
    ubicacion: "",
    marcaId: "",
    categoriaId: "",
    stockActual: "",
    stockMinimo: "",
    destacado: false,
    monedaPrecio: "USD",
    precioCosto: "",
    precioVenta: "",
    precioMayorista: "",
    precioOferta: "",
    esDecant: false,
  });

  const [marcas, setMarcas] = useState<Marca[]>(marcasIniciales);
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciales);

  // Estados para alta rápida de marcas/categorías
  const [mostrarAltaMarca, setMostrarAltaMarca] = useState(false);
  const [nuevaMarcaNombre, setNuevaMarcaNombre] = useState("");
  const [mostrarAltaCategoria, setMostrarAltaCategoria] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Cargar datos en caso de edición
  useEffect(() => {
    if (productoEditar) {
      setFormData(productoEditar);
    } else {
      setFormData({
        nombre: "",
        codigoBarras: "",
        ubicacion: "",
        marcaId: "",
        categoriaId: "",
        stockActual: 0,
        stockMinimo: 0,
        destacado: false,
        monedaPrecio: "USD",
        precioCosto: "",
        precioVenta: "",
        precioMayorista: "",
        precioOferta: "",
        esDecant: false,
      });
    }
    setErrorMsg("");
  }, [productoEditar, isOpen]);

  if (!isOpen) return null;

  // Alta rápida de marca
  const handleCrearMarcaRapida = async () => {
    if (!nuevaMarcaNombre.trim()) return;
    try {
      const res = await fetch("/api/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevaMarcaNombre }),
      });
      if (res.ok) {
        const marcaCreada = await res.json();
        setMarcas((prev) => [...prev, marcaCreada]);
        setFormData((prev) => ({ ...prev, marcaId: marcaCreada.id }));
        setNuevaMarcaNombre("");
        setMostrarAltaMarca(false);
      }
    } catch {
      console.error("Error al crear marca rápida");
    }
  };

  // Alta rápida de categoría
  const handleCrearCategoriaRapida = async () => {
    if (!nuevaCategoriaNombre.trim()) return;
    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevaCategoriaNombre }),
      });
      if (res.ok) {
        const catCreada = await res.json();
        setCategorias((prev) => [...prev, catCreada]);
        setFormData((prev) => ({ ...prev, categoriaId: catCreada.id }));
        setNuevaCategoriaNombre("");
        setMostrarAltaCategoria(false);
      }
    } catch {
      console.error("Error al crear categoría rápida");
    }
  };

  // Envío del formulario principal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validaciones de campos obligatorios
    if (
      !formData.nombre.trim() ||
      formData.stockActual === "" ||
      formData.precioCosto === "" ||
      formData.precioVenta === ""
    ) {
      setErrorMsg("Por favor completa todos los campos obligatorios (*)");
      return;
    }

    setLoading(true);

    try {
      const url = productoEditar?.id
        ? `/api/productos/${productoEditar.id}`
        : "/api/productos";
      const method = productoEditar?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al guardar producto");
      }

      onSuccess(); // Notifica al componente padre para actualizar el listado en tiempo real
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error insospechado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-semibold text-text">
            {productoEditar ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-dim hover:bg-surface-hover hover:text-text"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg bg-danger/10 p-3 text-xs text-danger">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nombre y Código de Barras */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-dim">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-dim">
                Código de Barras
              </label>
              <input
                type="text"
                value={formData.codigoBarras}
                onChange={(e) =>
                  setFormData({ ...formData, codigoBarras: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Ubicación, Marca y Categoría */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-text-dim">
                Ubicación en depósito
              </label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) =>
                  setFormData({ ...formData, ubicacion: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>

            {/* Marca + Alta Rápida */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-text-dim">
                  Marca
                </label>
                <button
                  type="button"
                  onClick={() => setMostrarAltaMarca(true)}
                  className="text-[11px] text-primary hover:underline"
                >
                  + Nueva
                </button>
              </div>
              <select
                value={formData.marcaId}
                onChange={(e) =>
                  setFormData({ ...formData, marcaId: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                <option value="">Seleccionar marca...</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría + Alta Rápida */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-text-dim">
                  Categoría
                </label>
                <button
                  type="button"
                  onClick={() => setMostrarAltaCategoria(true)}
                  className="text-[11px] text-primary hover:underline"
                >
                  + Nueva
                </button>
              </div>
              <select
                value={formData.categoriaId}
                onChange={(e) =>
                  setFormData({ ...formData, categoriaId: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                <option value="">Seleccionar categoría...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stocks */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-dim">
                Stock Actual *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stockActual}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockActual:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-dim">
                Stock Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockMinimo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockMinimo:
                      e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Precios y Moneda */}
          <div className="rounded-xl border border-border bg-surface-hover/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-dim">
                Precios
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-dim">Moneda:</label>
                <select
                  value={formData.monedaPrecio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monedaPrecio: e.target.value as "ARS" | "USD",
                    })
                  }
                  className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text font-medium"
                >
                  <option value="USD">USD ($)</option>
                  <option value="ARS">ARS ($)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-text-dim">
                  Costo *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.precioCosto}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      precioCosto:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-dim">
                  Venta (Minorista) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.precioVenta}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      precioVenta:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-dim">
                  Mayorista
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precioMayorista}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      precioMayorista:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-dim">
                  Oferta
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precioOferta}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      precioOferta:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col sm:flex-row gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="checkbox"
                checked={formData.destacado}
                onChange={(e) =>
                  setFormData({ ...formData, destacado: e.target.checked })
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Producto Destacado
            </label>

            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="checkbox"
                checked={formData.esDecant}
                onChange={(e) =>
                  setFormData({ ...formData, esDecant: e.target.checked })
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Se vende por decant
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-dim hover:bg-surface-hover"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>

      {/* Pop-up Alta Rápida Marca */}
      {mostrarAltaMarca && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded-xl border border-border bg-surface p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-text">Nueva Marca</h3>
            <input
              type="text"
              placeholder="Nombre de la marca"
              value={nuevaMarcaNombre}
              onChange={(e) => setNuevaMarcaNombre(e.target.value)}
              className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMostrarAltaMarca(false)}
                className="px-3 py-1 text-xs text-text-dim hover:underline"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCrearMarcaRapida}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Alta Rápida Categoría */}
      {mostrarAltaCategoria && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded-xl border border-border bg-surface p-4 shadow-xl">
            <h3 className="text-sm font-semibold text-text">Nueva Categoría</h3>
            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={nuevaCategoriaNombre}
              onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
              className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMostrarAltaCategoria(false)}
                className="px-3 py-1 text-xs text-text-dim hover:underline"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCrearCategoriaRapida}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}