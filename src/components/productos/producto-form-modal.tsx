"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BarcodeInput } from "@/components/ui/barcode-input";

export interface ProductoFormData {
  id?: string;
  nombre: string;
  codigoBarras: string;
  ubicacion: string;
  marcaId: string;
  categoriaId: string;
  contenidoMl: number | "";
  stockActual: number | "";
  stockMinimo: number | "";
  destacado: boolean;
  monedaPrecio: "ARS" | "USD";
  precioCosto: number | "";
  precioVenta: number | "";
  precioMayorista: number | "";
  precioOferta: number | "";
  esDecant: boolean;
  fotoUrl?: string | null;
  overrideDecant5ml: number | "";
  overrideDecant10ml: number | "";
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
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: "",
    codigoBarras: "",
    ubicacion: "",
    marcaId: "",
    categoriaId: "",
    contenidoMl: "",
    stockActual: "",
    stockMinimo: "",
    destacado: false,
    monedaPrecio: "USD",
    precioCosto: "",
    precioVenta: "",
    precioMayorista: "",
    precioOferta: "",
    esDecant: false,
    overrideDecant5ml: "",
    overrideDecant10ml: "",
  });

  const [marcas, setMarcas] = useState<Marca[]>(marcasIniciales);
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciales);

  // Estados para alta rápida
  const [mostrarAltaMarca, setMostrarAltaMarca] = useState(false);
  const [nuevaMarcaNombre, setNuevaMarcaNombre] = useState("");
  const [guardandoSubitem, setGuardandoSubitem] = useState(false);

  const [mostrarAltaCategoria, setMostrarAltaCategoria] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  

  const fetchAuxiliares = useCallback(async () => {
    try {
      const [resMarcas, resCategorias] = await Promise.all([
        fetch("/api/marcas"),
        fetch("/api/categorias"),
      ]);

      if (resMarcas.ok) {
        const dataM = await resMarcas.json();
        setMarcas(Array.isArray(dataM) ? dataM : dataM.items || []);
      }
      if (resCategorias.ok) {
        const dataC = await resCategorias.json();
        setCategorias(Array.isArray(dataC) ? dataC : dataC.items || []);
      }
    } catch (err) {
      console.error("Error al obtener marcas o categorías:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAuxiliares();

      if (productoEditar) {
        setFormData({
          ...productoEditar,
          nombre: productoEditar.nombre ?? "",
          codigoBarras: productoEditar.codigoBarras ?? "",
          ubicacion: productoEditar.ubicacion ?? "",
          marcaId: productoEditar.marcaId ?? "",
          categoriaId: productoEditar.categoriaId ?? "",
          contenidoMl: productoEditar.contenidoMl ?? "",
          stockActual: productoEditar.stockActual ?? "",
          stockMinimo: productoEditar.stockMinimo ?? "",
          destacado: productoEditar.destacado ?? false,
          monedaPrecio: productoEditar.monedaPrecio ?? "USD",
          precioCosto: productoEditar.precioCosto ?? "",
          precioVenta: productoEditar.precioVenta ?? "",
          precioMayorista: productoEditar.precioMayorista ?? "",
          precioOferta: productoEditar.precioOferta ?? "",
          esDecant: productoEditar.esDecant ?? false,
          overrideDecant5ml: productoEditar.overrideDecant5ml ?? "",
          overrideDecant10ml: productoEditar.overrideDecant10ml ?? "",
          id: productoEditar.id,
          fotoUrl: productoEditar.fotoUrl ?? "",
        });
        setPreviewUrl(productoEditar.fotoUrl || null);
      } else {
        setFormData({
          nombre: "",
          codigoBarras: "",
          ubicacion: "",
          marcaId: "",
          categoriaId: "",
          contenidoMl: "",
          stockActual: 0,
          stockMinimo: 0,
          destacado: false,
          monedaPrecio: "USD",
          precioCosto: "",
          precioVenta: "",
          precioMayorista: "",
          precioOferta: "",
          esDecant: false,
          fotoUrl: "",
          overrideDecant5ml: "",
         overrideDecant10ml: "",
        }); setPreviewUrl(null);
      }
      setSelectedFile(null);
      setErrorMsg("");
    }
  }, [productoEditar, isOpen, fetchAuxiliares]);

  if (!isOpen) return null;

  // Alta rápida de marca
  const handleCrearMarcaRapida = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nuevaMarcaNombre.trim()) return;

    try {
      setGuardandoSubitem(true);
      const res = await fetch("/api/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevaMarcaNombre.trim() }),
      });

      if (res.ok) {
        const marcaCreada = await res.json();
        setMarcas((prev) => [...prev, marcaCreada]);
        setFormData((prev) => ({ ...prev, marcaId: marcaCreada.id }));
        setNuevaMarcaNombre("");
        setMostrarAltaMarca(false);
      } else {
        const errData = await res.json();
        alert(errData.message || "Error al crear la marca");
      }
    } catch (err) {
      console.error("Error al crear marca rápida:", err);
      alert("Error de conexión al guardar la marca");
    } finally {
      setGuardandoSubitem(false);
    }
  };

  // Alta rápida de categoría
  const handleCrearCategoriaRapida = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nuevaCategoriaNombre.trim()) return;

    try {
      setGuardandoSubitem(true);
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevaCategoriaNombre.trim() }),
      });

      if (res.ok) {
        const catCreada = await res.json();
        setCategorias((prev) => [...prev, catCreada]);
        setFormData((prev) => ({ ...prev, categoriaId: catCreada.id }));
        setNuevaCategoriaNombre("");
        setMostrarAltaCategoria(false);
      } else {
        const errData = await res.json();
        alert(errData.message || "Error al crear la categoría");
      }
    } catch (err) {
      console.error("Error al crear categoría rápida:", err);
      alert("Error de conexión al guardar la categoría");
    } finally {
      setGuardandoSubitem(false);
    }
  };

  // Alta de imagen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Por favor selecciona una imagen válida (JPG o PNG).");
      return;
    }

  setSelectedFile(file);
  setPreviewUrl(URL.createObjectURL(file));
  setErrorMsg("");
};

const handleRemoveImage = () => {
  setSelectedFile(null);
  setPreviewUrl(null);
  setFormData((prev) => ({ ...prev, fotoUrl: "" }));
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg("");

  // Validaciones de obligatorios
  if (
    !formData.nombre.trim() ||
    formData.stockActual === "" ||
    formData.precioCosto === "" ||
    formData.precioVenta === ""
  ) {
    setErrorMsg("Por favor completa los campos obligatorios (*)");
    return;
  }

  setLoading(true);

  try {
    let finalFotoUrl = formData.fotoUrl || null;

    // Si el usuario seleccionó un archivo nuevo
    if (selectedFile) {
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);

      // Si se está editando y el producto tenía una foto anterior, la enviamos para que el servidor la elimine
      if (productoEditar?.fotoUrl) {
        uploadData.append("fotoUrlAnterior", productoEditar.fotoUrl);
      }

      const resUpload = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!resUpload.ok) {
        const errData = await resUpload.json();
        throw new Error(errData.error || "Error al subir la imagen");
      }

      const { url } = await resUpload.json();
      finalFotoUrl = url;
    }

    // Formateo del payload
    const payload = {
      ...formData,
      nombre: formData.nombre?.trim() || "",
      codigoBarras: formData.codigoBarras?.trim() || null,
      ubicacion: formData.ubicacion?.trim() || null,
      marcaId: formData.marcaId ? String(formData.marcaId) : null,
      categoriaId: formData.categoriaId ? String(formData.categoriaId) : null,
      contenidoMl: formData.contenidoMl === "" ? null : Number(formData.contenidoMl),
      stockActual: Number(formData.stockActual),
      stockMinimo: formData.stockMinimo === "" ? 0 : Number(formData.stockMinimo),
      precioCosto: Number(formData.precioCosto),
      precioVenta: Number(formData.precioVenta),
      overrideDecant5ml: formData.overrideDecant5ml === "" ? null : Number(formData.overrideDecant5ml),
      overrideDecant10ml: formData.overrideDecant10ml === "" ? null : Number(formData.overrideDecant10ml),
      precioMayorista:
        formData.precioMayorista === "" || formData.precioMayorista === null
          ? null
          : Number(formData.precioMayorista),
      precioOferta:
        formData.precioOferta === "" || formData.precioOferta === null
          ? null
          : Number(formData.precioOferta),
      fotoUrl: finalFotoUrl,
    };

    // IMPORTANTE: URL absoluta con "/" al inicio
    const url = productoEditar?.id
      ? `/api/productos/${productoEditar.id}`
      : "/api/productos";
    const method = productoEditar?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Error al guardar el producto");
    }

    onSuccess();
    onClose();
  } catch (err: any) {
    console.error("Error submit producto:", err);
    setErrorMsg(err.message || "Ocurrió un error inesperado al guardar el producto");
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
            type="button"
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
              <BarcodeInput
                value={formData.codigoBarras}
                onChange={(value) =>
                  setFormData({ ...formData, codigoBarras: value })
                }
                placeholder="Escaneá o tipeá el código..."
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Ubicación, Marca y Categoría */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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

            <div>
              <label className="block text-xs font-medium text-text-dim">
                Contenido (ml)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Ej: 100"
                value={formData.contenidoMl ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contenidoMl: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>

            {/* Marca */}
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

            {/* Categoría */}
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

          {/* Precios */}
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

          {/* Overrides de precio de decant — solo si "se vende por decant" está activo */}
          {formData.esDecant && (
            <div className="rounded-xl border border-border bg-surface-hover/30 p-4 space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-dim">
                  Precios manuales de decant (opcional)
                </span>
                <p className="mt-1 text-xs text-text-dim">
                  Si cargás un valor acá, se usa tal cual al vender el decant, en vez del
                  cálculo automático por fórmula. Dejalo vacío para seguir usando la fórmula.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-dim">
                    Precio decant 5ml
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Cálculo automático"
                    value={formData.overrideDecant5ml}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overrideDecant5ml:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-dim">
                    Precio decant 10ml
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Cálculo automático"
                    value={formData.overrideDecant10ml}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        overrideDecant10ml:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-medium text-text">
              Imagen del Producto
            </label>

            <div className="flex items-center gap-4">
              {/* Previsualización */}
              {previewUrl ? (
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
                  <img
                    src={previewUrl}
                    alt="Previsualización"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-80 hover:opacity-100 disabled:opacity-50"
                    title="Quitar imagen"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface text-xs text-text/50">
                  Sin imagen
                </div>
              )}

              {/* Input oculto e invocación desde el Botón */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg, image/png, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text shadow-sm hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {previewUrl ? "Cambiar imagen" : "Cargar imagen"}
                </button>

                <p className="mt-1 text-xs text-text/60">
                  Formatos permitidos: JPG, PNG o WEBP.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción principal */}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
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
                disabled={guardandoSubitem}
                onClick={handleCrearMarcaRapida}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                {guardandoSubitem ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Alta Rápida Categoría */}
      {mostrarAltaCategoria && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
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
                disabled={guardandoSubitem}
                onClick={handleCrearCategoriaRapida}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                {guardandoSubitem ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}