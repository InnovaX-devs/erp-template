"use client";

import { useEffect, useState } from "react";

interface Categoria {
  id: number;
  nombre: string;
}

interface Cuenta {
  id: number;
  nombre: string;
  tipo: string;
}

interface ProveedorSugerido {
  id: number;
  nombre: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GastoFormModal({ isOpen, onClose, onSuccess }: Props) {
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estadoPago, setEstadoPago] = useState<"PENDIENTE" | "PAGAR_AHORA">("PENDIENTE");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [creandoCategoria, setCreandoCategoria] = useState(false);

  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [cuentaId, setCuentaId] = useState<string>("");

  const [busquedaProveedor, setBusquedaProveedor] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<ProveedorSugerido | null>(null);
  const [sugerenciasProveedor, setSugerenciasProveedor] = useState<ProveedorSugerido[]>([]);
  const [creandoProveedor, setCreandoProveedor] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/categorias-gasto")
      .then((r) => r.json())
      .then((d) => setCategorias(d.items ?? []));
    fetch("/api/cuentas")
      .then((r) => r.json())
      .then((d) => setCuentas(d.items ?? []));

    setMonto("");
    setConcepto("");
    setObservaciones("");
    setEstadoPago("PENDIENTE");
    setCategoriaId("");
    setNuevaCategoria("");
    setCuentaId("");
    setBusquedaProveedor("");
    setProveedorSeleccionado(null);
    setSugerenciasProveedor([]);
    setErrorMsg("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || proveedorSeleccionado || !busquedaProveedor.trim()) {
      setSugerenciasProveedor([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/proveedores?q=${encodeURIComponent(busquedaProveedor)}`);
      if (res.ok) {
        const data = await res.json();
        setSugerenciasProveedor(data.items ?? []);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [busquedaProveedor, proveedorSeleccionado, isOpen]);

  if (!isOpen) return null;

  const crearCategoria = async () => {
    if (!nuevaCategoria.trim()) return;
    setCreandoCategoria(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/categorias-gasto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevaCategoria }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la categoría");
      setCategorias((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setCategoriaId(String(data.id));
      setNuevaCategoria("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al crear la categoría");
    } finally {
      setCreandoCategoria(false);
    }
  };

  const crearProveedor = async () => {
    if (!busquedaProveedor.trim()) return;
    setCreandoProveedor(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: busquedaProveedor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear el proveedor");
      setProveedorSeleccionado({ id: data.id, nombre: data.nombre });
      setSugerenciasProveedor([]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al crear el proveedor");
    } finally {
      setCreandoProveedor(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const montoNum = Number(monto);
    if (!montoNum || montoNum <= 0) {
      setErrorMsg("El monto debe ser mayor a 0");
      return;
    }
    if (!concepto.trim()) {
      setErrorMsg("El concepto es obligatorio");
      return;
    }
    if (estadoPago === "PAGAR_AHORA" && !cuentaId) {
      setErrorMsg("Elegí la cuenta de origen del pago");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monto: montoNum,
          concepto,
          observaciones,
          estadoPago,
          categoriaId: categoriaId || null,
          proveedorId: proveedorSeleccionado?.id ?? null,
          cuentaId: cuentaId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el gasto");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-semibold text-text">Nuevo Gasto</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-text-dim hover:bg-surface-hover hover:text-text">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg bg-danger/10 p-3 text-xs text-danger">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-dim">Monto *</label>
              <input
                type="number"
                step="0.01"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-dim">Concepto *</label>
              <input
                type="text"
                required
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-medium text-text-dim">Categoría</label>
            <div className="mt-1 flex gap-2">
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Nueva categoría..."
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                disabled={creandoCategoria || !nuevaCategoria.trim()}
                onClick={crearCategoria}
                className="shrink-0 rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                {creandoCategoria ? "..." : "+ Agregar"}
              </button>
            </div>
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-xs font-medium text-text-dim">Proveedor (opcional)</label>
            {proveedorSeleccionado ? (
              <div className="mt-1 flex items-center justify-between rounded-lg border border-border bg-surface-hover/30 px-3 py-2 text-sm text-text">
                {proveedorSeleccionado.nombre}
                <button
                  type="button"
                  onClick={() => setProveedorSeleccionado(null)}
                  className="text-xs text-text-dim hover:text-text"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar proveedor..."
                  value={busquedaProveedor}
                  onChange={(e) => setBusquedaProveedor(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
                />
                {busquedaProveedor.trim() && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
                    {sugerenciasProveedor.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setProveedorSeleccionado(p);
                          setBusquedaProveedor("");
                        }}
                        className="block w-full px-3 py-2 text-left text-sm text-text hover:bg-surface-hover"
                      >
                        {p.nombre}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={creandoProveedor}
                      onClick={crearProveedor}
                      className="block w-full border-t border-border px-3 py-2 text-left text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
                    >
                      {creandoProveedor ? "Creando..." : `+ Crear proveedor "${busquedaProveedor}"`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-dim">Observaciones</label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-medium text-text-dim">Estado</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(
                [
                  { value: "PENDIENTE", label: "Pendiente" },
                  { value: "PAGAR_AHORA", label: "Pagar ahora" },
                ] as const
              ).map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setEstadoPago(op.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    estadoPago === op.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-dim hover:bg-surface-hover"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {estadoPago === "PAGAR_AHORA" && (
            <div>
              <label className="block text-xs font-medium text-text-dim">Cuenta de origen *</label>
              <select
                required
                value={cuentaId}
                onChange={(e) => setCuentaId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
              >
                <option value="">Seleccionar cuenta...</option>
                {cuentas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {loading ? "Guardando..." : "Guardar Gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}