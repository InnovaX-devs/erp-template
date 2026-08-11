"use client";

import { useCallback, useEffect, useState } from "react";
import { GastoFormModal } from "@/components/gastos/gasto-form-modal";

interface Gasto {
  id: number;
  monto: number;
  concepto: string;
  observaciones: string | null;
  estadoPago: "PENDIENTE" | "PAGADO";
  fecha: string;
  categoria: { id: number; nombre: string } | null;
  proveedor: { id: number; nombre: string } | null;
}

interface Resumen {
  totalGastos: number;
  totalPendientes: number;
  cajaDisponible: number;
}

interface Cuenta {
  id: number;
  nombre: string;
}

export function GastosTab() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "pendiente" | "pagado">("todos");
  const [isCrearOpen, setIsCrearOpen] = useState(false);

  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [resumen, setResumen] = useState<Resumen>({
    totalGastos: 0,
    totalPendientes: 0,
    cajaDisponible: 0,
  });
  const [cargando, setCargando] = useState(true);

  const [gastoAPagar, setGastoAPagar] = useState<Gasto | null>(null);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [cuentaPagoId, setCuentaPagoId] = useState("");
  const [pagando, setPagando] = useState(false);

  const cargarGastos = useCallback(async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams();
      if (busqueda) params.set("q", busqueda);
      if (filtroEstado !== "todos") params.set("estado", filtroEstado);

      const res = await fetch(`/api/gastos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGastos(data.items);
        setResumen(data.resumen);
      }
    } catch (error) {
      console.error("Error al cargar gastos:", error);
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroEstado]);

  useEffect(() => {
    const timeout = setTimeout(cargarGastos, 250);
    return () => clearTimeout(timeout);
  }, [cargarGastos]);

  const abrirPago = async (gasto: Gasto) => {
    setGastoAPagar(gasto);
    setCuentaPagoId("");
    const res = await fetch("/api/cuentas");
    if (res.ok) {
      const data = await res.json();
      setCuentas(data.items ?? []);
    }
  };

  const confirmarPago = async () => {
    if (!gastoAPagar || !cuentaPagoId) return;
    setPagando(true);
    try {
      const res = await fetch(`/api/gastos/${gastoAPagar.id}/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuentaId: cuentaPagoId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al pagar el gasto");
      }
      setGastoAPagar(null);
      cargarGastos();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error al pagar el gasto");
    } finally {
      setPagando(false);
    }
  };

  const eliminarGasto = async (gasto: Gasto) => {
    if (!confirm(`¿Eliminar el gasto "${gasto.concepto}"?`)) return;
    try {
      const res = await fetch(`/api/gastos/${gasto.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar el gasto");
      }
      cargarGastos();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al eliminar el gasto");
    }
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-text">Gastos</h2>
          <p className="text-sm text-text-dim">Gestión de gastos y categorías</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCrearOpen(true)}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nuevo Gasto
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Total Gastos</p>
          <p className="mt-1 text-2xl font-semibold text-text">{formatMoney(resumen.totalGastos)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Pendientes</p>
          <p className="mt-1 text-2xl font-semibold text-danger">
            {formatMoney(resumen.totalPendientes)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Caja Disponible</p>
          <p className="mt-1 text-2xl font-semibold text-text">
            {formatMoney(resumen.cajaDisponible)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por concepto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-primary focus:outline-none sm:w-64"
          />
          <div className="flex gap-2">
            {(
              [
                { value: "todos", label: "Todos" },
                { value: "pendiente", label: "Pendientes" },
                { value: "pagado", label: "Pagados" },
              ] as const
            ).map((op) => (
              <button
                key={op.value}
                onClick={() => setFiltroEstado(op.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  filtroEstado === op.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-text-dim hover:bg-surface-hover"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="pb-3 pr-4 font-medium">Concepto</th>
                <th className="pb-3 pr-4 font-medium">Categoría</th>
                <th className="pb-3 pr-4 font-medium">Proveedor</th>
                <th className="pb-3 pr-4 font-medium">Fecha</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 pr-4 font-medium">Monto</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-text-dim">
                    Cargando gastos...
                  </td>
                </tr>
              ) : gastos.length > 0 ? (
                gastos.map((g) => (
                  <tr key={g.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium text-text">{g.concepto}</td>
                    <td className="py-3 pr-4 text-text-dim">{g.categoria?.nombre || "-"}</td>
                    <td className="py-3 pr-4 text-text-dim">{g.proveedor?.nombre || "-"}</td>
                    <td className="py-3 pr-4 text-text-dim">
                      {new Date(g.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          g.estadoPago === "PAGADO"
                            ? "bg-primary/10 text-primary"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {g.estadoPago === "PAGADO" ? "Pagado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-text-dim">{formatMoney(g.monto)}</td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex justify-end gap-2">
                        {g.estadoPago === "PENDIENTE" && (
                          <button
                            onClick={() => abrirPago(g)}
                            className="rounded-lg border border-primary px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                          >
                            Marcar pagado
                          </button>
                        )}
                        <button
                          onClick={() => eliminarGasto(g)}
                          className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-text-dim hover:bg-surface-hover"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-text-dim">
                    No se encontraron gastos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GastoFormModal isOpen={isCrearOpen} onClose={() => setIsCrearOpen(false)} onSuccess={cargarGastos} />

      {gastoAPagar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-text">Marcar como pagado</h3>
            <p className="mt-1 text-sm text-text-dim">
              {gastoAPagar.concepto} — {formatMoney(gastoAPagar.monto)}
            </p>
            <div className="mt-4">
              <label className="block text-xs font-medium text-text-dim">Cuenta de origen *</label>
              <select
                value={cuentaPagoId}
                onChange={(e) => setCuentaPagoId(e.target.value)}
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
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setGastoAPagar(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-dim hover:bg-surface-hover"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPago}
                disabled={!cuentaPagoId || pagando}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {pagando ? "Guardando..." : "Confirmar pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}