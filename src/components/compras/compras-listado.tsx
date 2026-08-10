"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface Compra {
  id: number;
  proveedor: { nombre: string } | null;
  cuenta: { nombre: string; tipo: string } | null;
  totalUSD: number;
  totalARS: number | null;
  confirmada: boolean;
  pagada: boolean;
  recibida: boolean;
  cancelada: boolean;
  fecha: string;
}

type FiltroKey = "todas" | "pendientes" | "confirmadas" | "canceladas";

const FILTROS: { key: FiltroKey; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendientes", label: "Pendientes" },
  { key: "confirmadas", label: "Confirmadas" },
  { key: "canceladas", label: "Canceladas" },
];

function estadoDeCompra(compra: Compra): { label: string; className: string } {
  if (compra.cancelada) {
    return { label: "Cancelada", className: "bg-danger/10 text-danger" };
  }
  if (compra.confirmada) {
    return { label: "Confirmada", className: "bg-primary/10 text-primary" };
  }
  return { label: "Pendiente", className: "bg-text-dim/10 text-text-dim" };
}

export function ComprasListado() {
  const [filtro, setFiltro] = useState<FiltroKey>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionandoId, setAccionandoId] = useState<number | null>(null);

  const cargarCompras = () => {
    setCargando(true);
    setError(null);

    const url = filtro === "todas" ? "/api/compras" : `/api/compras?filtro=${filtro}`;

    return fetch(url)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar las compras");
        setCompras(data.items ?? []);
      })
      .catch((err) => setError(err.message || "Error al cargar las compras"))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarCompras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  const comprasFiltradas = compras.filter((c) =>
    (c.proveedor?.nombre ?? "").toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  const ejecutarAccion = async (id: number, accion: "confirmar" | "cancelar") => {
    setAccionandoId(id);
    try {
      const res = await fetch(`/api/compras/${id}/${accion}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error al ${accion} la compra`);
      await cargarCompras();
    } catch (err: any) {
      setError(err.message || `Error al ${accion} la compra`);
    } finally {
      setAccionandoId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-text">Compras</h2>
          <p className="text-sm text-text-dim">Gestión de compras a proveedores</p>
        </div>
        <Link
          href="/compras/nueva"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nueva Compra
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por proveedor..."
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltro(f.key)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                filtro === f.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-dim hover:text-text"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="rounded-xl border border-border bg-surface">
        {cargando ? (
          <p className="p-8 text-center text-sm text-text-dim">Cargando...</p>
        ) : comprasFiltradas.length === 0 ? (
          <p className="p-8 text-center text-sm text-text-dim">
            {busqueda.trim()
              ? "No hay compras que coincidan con la búsqueda."
              : "No hay compras para este filtro."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 font-medium">Cuenta</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comprasFiltradas.map((compra) => {
                const estado = estadoDeCompra(compra);
                const puedeAccionar = !compra.confirmada && !compra.cancelada;
                const cargandoFila = accionandoId === compra.id;
                return (
                  <tr key={compra.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-text">#{compra.id}</td>
                    <td className="px-4 py-3 text-text">
                      {compra.proveedor?.nombre ?? "Sin especificar"}
                    </td>
                    <td className="px-4 py-3 text-text-dim">{compra.cuenta?.nombre ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-text">
                      USD {compra.totalUSD.toFixed(2)}
                      {compra.totalARS != null && (
                        <span className="ml-1 text-xs font-normal text-text-dim">
                          (ARS{" "}
                          {compra.totalARS.toLocaleString("es-AR", {
                            maximumFractionDigits: 0,
                          })}
                          )
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          estado.className
                        )}
                      >
                        {estado.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-dim">
                      {new Date(compra.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      {puedeAccionar ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            title="Confirmar compra"
                            aria-label="Confirmar compra"
                            disabled={cargandoFila}
                            onClick={() => ejecutarAccion(compra.id, "confirmar")}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            title="Cancelar compra"
                            aria-label="Cancelar compra"
                            disabled={cargandoFila}
                            onClick={() => ejecutarAccion(compra.id, "cancelar")}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-danger text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="text-text-dim">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}