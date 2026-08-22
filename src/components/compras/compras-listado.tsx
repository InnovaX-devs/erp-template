"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, RefreshCw, Loader2 } from "lucide-react";
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
    return { label: "Cancelada", className: "bg-[#fbe4e4] text-[#ba1a1a]" };
  }
  if (compra.confirmada) {
    return { label: "Confirmada", className: "bg-[#e3e6f5] text-[#021541]" };
  }
  return { label: "Pendiente", className: "bg-[#e0e3e5] text-[#45464f]" };
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
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-[#191c1e] sm:text-2xl">Compras</h1>
        <Link
          href="/compras/nueva"
          className="flex items-center justify-center gap-1.5 self-start rounded-lg bg-[#021541] px-4 py-2 text-sm text-white hover:opacity-90 sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Nueva Compra
        </Link>
      </div>

      {/* Filtros */}
      <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#45464f]" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por proveedor..."
            className="w-full rounded-lg border border-[#c5c6d0] bg-white py-2 pl-9 pr-3 text-sm text-[#191c1e] placeholder:text-[#45464f] focus:outline-none focus:ring-1 focus:ring-[#021541]"
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
                    ? "bg-[#021541] text-white"
                    : "border border-[#c5c6d0] bg-white text-[#45464f] hover:bg-[#eceef0]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => cargarCompras(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#c5c6d0] text-[#45464f] hover:bg-[#eceef0]"
            aria-label="Actualizar"
          >
            <RefreshCw className={cn("h-4 w-4", recargando && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-[#ba1a1a]">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        {cargando ? (
          <p className="p-8 text-center text-sm text-[#45464f]">Cargando...</p>
        ) : comprasFiltradas.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#45464f]">
            {busqueda.trim()
              ? "No hay compras que coincidan con la búsqueda."
              : "No hay compras para este filtro."}
          </p>
        ) : (
          <>
            {/* Desktop / tablet: tabla */}
            <div className="relative hidden overflow-x-auto md:block">
              {recargando && (
                <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-16 backdrop-blur-[1px]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#021541]" />
                </div>
              )}
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-[#F1F5F9]">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Proveedor</th>
                    <th className="px-4 py-3">Cuenta</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comprasPagina.map((compra) => {
                    const estado = estadoDeCompra(compra);
                    const puedeAccionar = !compra.confirmada && !compra.cancelada;
                    const cargandoFila = accionandoId === compra.id;
                    return (
                      <tr key={compra.id} className="border-t border-[#E2E8F0]">
                        <td className="px-4 py-4 font-mono text-xs text-[#45464f]">#{compra.id}</td>
                        <td className="px-4 py-4 font-medium text-[#191c1e]">
                          {compra.proveedor?.nombre ?? "Sin especificar"}
                        </td>
                        <td className="px-4 py-4 text-[#45464f]">{compra.cuenta?.nombre ?? "—"}</td>
                        <td className="px-4 py-4 font-mono font-medium text-[#191c1e]">
                          USD {compra.totalUSD.toFixed(2)}
                          {compra.totalARS != null && (
                            <span className="ml-1 text-xs font-normal text-[#45464f]">
                              (ARS {compra.totalARS.toLocaleString("es-AR", { maximumFractionDigits: 0 })})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-semibold",
                              estado.className
                            )}
                          >
                            {estado.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#45464f]">
                          {new Date(compra.fecha).toLocaleDateString("es-AR")}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {puedeAccionar ? (
                            <div className="flex items-center justify-end gap-3">
                              <button
                                type="button"
                                disabled={cargandoFila}
                                onClick={() => ejecutarAccion(compra.id, "confirmar")}
                                className="text-sm text-[#021541] hover:underline disabled:opacity-50"
                              >
                                {cargandoFila ? "..." : "Confirmar"}
                              </button>
                              <button
                                type="button"
                                disabled={cargandoFila}
                                onClick={() => ejecutarAccion(compra.id, "cancelar")}
                                className="text-sm text-[#ba1a1a] hover:underline disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <span className="text-[#45464f]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: tarjetas */}
            <div className="relative divide-y divide-[#E2E8F0] md:hidden">
              {recargando && (
                <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-10 backdrop-blur-[1px]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#021541]" />
                </div>
              )}
              {comprasPagina.map((compra) => {
                const estado = estadoDeCompra(compra);
                const puedeAccionar = !compra.confirmada && !compra.cancelada;
                const cargandoFila = accionandoId === compra.id;
                return (
                  <div key={compra.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-[#45464f]">#{compra.id}</p>
                        <p className="truncate font-medium text-[#191c1e]">
                          {compra.proveedor?.nombre ?? "Sin especificar"}
                        </p>
                        <p className="text-xs text-[#45464f]">{compra.cuenta?.nombre ?? "—"}</p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                          estado.className
                        )}
                      >
                        {estado.label}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono font-semibold text-[#191c1e]">
                        USD {compra.totalUSD.toFixed(2)}
                        {compra.totalARS != null && (
                          <span className="ml-1 text-xs font-normal text-[#45464f]">
                            (ARS {compra.totalARS.toLocaleString("es-AR", { maximumFractionDigits: 0 })})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#45464f]">{new Date(compra.fecha).toLocaleDateString("es-AR")}</p>
                    </div>

                    {puedeAccionar && (
                      <div className="mt-3 flex items-center gap-4">
                        <button
                          type="button"
                          disabled={cargandoFila}
                          onClick={() => ejecutarAccion(compra.id, "confirmar")}
                          className="text-sm font-medium text-[#021541] disabled:opacity-50"
                        >
                          {cargandoFila ? "..." : "Confirmar"}
                        </button>
                        <button
                          type="button"
                          disabled={cargandoFila}
                          onClick={() => ejecutarAccion(compra.id, "cancelar")}
                          className="text-sm font-medium text-[#ba1a1a] disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Paginación: bloque separado, igual que en Clientes */}
      {totalRegistros > 0 && (
        <div className="flex flex-col gap-2 text-sm text-[#45464f] sm:flex-row sm:items-center sm:justify-between">
          <span>
            {totalRegistros} compra{totalRegistros !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#c5c6d0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eceef0]"
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPaginas}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
              disabled={page >= totalPaginas}
              className="px-3 py-1.5 rounded-lg border border-[#c5c6d0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eceef0]"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}