"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, RefreshCw, Check, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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

const PAGE_SIZE = 15;

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
  const [recargando, setRecargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accionandoId, setAccionandoId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const cargarCompras = (esRecarga = false) => {
    if (esRecarga) setRecargando(true);
    else setCargando(true);
    setError(null);

    const url = filtro === "todas" ? "/api/compras" : `/api/compras?filtro=${filtro}`;

    return fetch(url)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar las compras");
        setCompras(data.items ?? []);
      })
      .catch((err) => setError(err.message || "Error al cargar las compras"))
      .finally(() => {
        setCargando(false);
        setRecargando(false);
      });
  };

  useEffect(() => {
    cargarCompras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  // Volver a página 1 cuando cambian filtro o búsqueda
  useEffect(() => {
    setPage(1);
  }, [filtro, busqueda]);

  const comprasFiltradas = compras.filter((c) =>
    (c.proveedor?.nombre ?? "").toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  const totalRegistros = comprasFiltradas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / PAGE_SIZE));
  const comprasPagina = comprasFiltradas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const ejecutarAccion = async (id: number, accion: "confirmar" | "cancelar") => {
    setAccionandoId(id);
    try {
      const res = await fetch(`/api/compras/${id}/${accion}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error al ${accion} la compra`);
      await cargarCompras(true);
    } catch (err: any) {
      setError(err.message || `Error al ${accion} la compra`);
    } finally {
      setAccionandoId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-text">Compras</h2>
          <p className="text-sm text-text-dim">Gestión de compras a proveedores</p>
        </div>
        <Link
          href="/compras/nueva"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nueva Compra
        </Link>
      </div>

      {/* Filtros */}
      <div className="space-y-3 rounded-xl border border-border bg-surface p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por proveedor..."
            className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {FILTROS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFiltro(f.key)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filtro === f.key
                    ? "bg-primary text-white"
                    : "border border-border bg-surface text-text-dim hover:border-primary/40 hover:text-text"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => cargarCompras(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-dim hover:text-text"
              aria-label="Actualizar"
            >
              <RefreshCw className={cn("h-4 w-4", recargando && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {cargando ? (
          <p className="p-8 text-center text-sm text-text-dim">Cargando...</p>
        ) : comprasFiltradas.length === 0 ? (
          <p className="p-8 text-center text-sm text-text-dim">
            {busqueda.trim()
              ? "No hay compras que coincidan con la búsqueda."
              : "No hay compras para este filtro."}
          </p>
        ) : (
          <>
            {/* Desktop / tablet: tabla */}
            <div className="relative hidden overflow-x-auto md:block">
              {recargando && (
                <div className="absolute inset-0 z-10 flex items-start justify-center bg-surface/60 pt-16 backdrop-blur-[1px]">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              <table className="w-full min-w-[720px] text-sm">
                <thead className="sticky top-0 z-[5]">
                  <tr className="bg-ink text-left text-xs font-medium uppercase tracking-wide text-ivory">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Proveedor</th>
                    <th className="px-4 py-3 font-medium">Cuenta</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comprasPagina.map((compra) => {
                    const estado = estadoDeCompra(compra);
                    const puedeAccionar = !compra.confirmada && !compra.cancelada;
                    const cargandoFila = accionandoId === compra.id;
                    return (
                      <tr key={compra.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-text-dim">#{compra.id}</td>
                        <td className="px-4 py-3 font-medium text-text">
                          {compra.proveedor?.nombre ?? "Sin especificar"}
                        </td>
                        <td className="px-4 py-3 text-text-dim">{compra.cuenta?.nombre ?? "—"}</td>
                        <td className="px-4 py-3 font-mono font-medium text-text">
                          USD {compra.totalUSD.toFixed(2)}
                          {compra.totalARS != null && (
                            <span className="ml-1 text-xs font-normal text-text-dim">
                              (ARS {compra.totalARS.toLocaleString("es-AR", { maximumFractionDigits: 0 })})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                              estado.className
                            )}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {estado.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-dim">
                          {new Date(compra.fecha).toLocaleDateString("es-AR")}
                        </td>
                        <td className="px-4 py-3">
                          {puedeAccionar ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                title="Confirmar compra"
                                aria-label="Confirmar compra"
                                disabled={cargandoFila}
                                onClick={() => ejecutarAccion(compra.id, "confirmar")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary text-primary hover:bg-primary/10 disabled:opacity-50"
                              >
                                {cargandoFila ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              </button>
                              <button
                                type="button"
                                title="Cancelar compra"
                                aria-label="Cancelar compra"
                                disabled={cargandoFila}
                                onClick={() => ejecutarAccion(compra.id, "cancelar")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger text-danger hover:bg-danger/10 disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="block text-right text-text-dim">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: tarjetas */}
            <div className="relative divide-y divide-border md:hidden">
              {recargando && (
                <div className="absolute inset-0 z-10 flex items-start justify-center bg-surface/60 pt-10 backdrop-blur-[1px]">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              {comprasPagina.map((compra) => {
                const estado = estadoDeCompra(compra);
                const puedeAccionar = !compra.confirmada && !compra.cancelada;
                const cargandoFila = accionandoId === compra.id;
                return (
                  <div key={compra.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-text-dim">#{compra.id}</p>
                        <p className="truncate font-medium text-text">
                          {compra.proveedor?.nombre ?? "Sin especificar"}
                        </p>
                        <p className="text-xs text-text-dim">{compra.cuenta?.nombre ?? "—"}</p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                          estado.className
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {estado.label}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono font-semibold text-text">
                        USD {compra.totalUSD.toFixed(2)}
                        {compra.totalARS != null && (
                          <span className="ml-1 text-xs font-normal text-text-dim">
                            (ARS {compra.totalARS.toLocaleString("es-AR", { maximumFractionDigits: 0 })})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-text-dim">{new Date(compra.fecha).toLocaleDateString("es-AR")}</p>
                    </div>

                    {puedeAccionar && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          disabled={cargandoFila}
                          onClick={() => ejecutarAccion(compra.id, "confirmar")}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
                        >
                          {cargandoFila ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Confirmar
                        </button>
                        <button
                          type="button"
                          disabled={cargandoFila}
                          onClick={() => ejecutarAccion(compra.id, "cancelar")}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-danger py-2 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            <div className="flex flex-col items-center gap-2 border-t border-border px-4 py-3 sm:flex-row sm:justify-between">
              <p className="text-xs text-text-dim">
                {totalRegistros} compra{totalRegistros !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-dim hover:text-text disabled:opacity-40"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-text-dim">
                  {page} / {totalPaginas}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPaginas}
                  onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-dim hover:text-text disabled:opacity-40"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}