"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { listarVentas } from "../actions";
import type { EstadoPago } from "@prisma/client";
import type { FiltroEstado, VentaListItem } from "@/types/venta";

const PAGE_SIZE = 15;

const FILTROS_ESTADO: { label: string; value: FiltroEstado }[] = [
  { label: "Todos", value: "TODOS" },
  { label: "Pagadas", value: "PAGADA" },
  { label: "A cuenta", value: "A_CUENTA" },
  { label: "Canceladas", value: "CANCELADA" },
];

const ESTADO_STYLE: Record<EstadoPago, string> = {
  PAGADA: "bg-success/10 text-success",
  A_CUENTA: "bg-amber/10 text-amber",
  ANULADA: "bg-text-dim/10 text-text-dim",
  CANCELADA: "bg-danger/10 text-danger",
};

const ESTADO_LABEL: Record<EstadoPago, string> = {
  PAGADA: "Pagada",
  A_CUENTA: "A cuenta",
  ANULADA: "Anulada",
  CANCELADA: "Cancelada",
};

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

export default function HistorialVentasPage() {
  const [ventas, setVentas] = useState<VentaListItem[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [isPending, startTransition] = useTransition();

  const [estado, setEstado] = useState<FiltroEstado>("TODOS");
  const [clienteInput, setClienteInput] = useState("");
  const [clienteTexto, setClienteTexto] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [orden, setOrden] = useState<"MAS_NUEVO" | "MAS_VIEJO">("MAS_NUEVO");
  const [page, setPage] = useState(1);

  // Debounce del buscador de cliente
  useEffect(() => {
    const t = setTimeout(() => {
      setClienteTexto(clienteInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [clienteInput]);

  function cargar() {
    startTransition(async () => {
      const resultado = await listarVentas({
        estado,
        clienteTexto,
        fechaDesde: fechaDesde || null,
        fechaHasta: fechaHasta || null,
        orden,
        page,
        pageSize: PAGE_SIZE,
      });
      setVentas(resultado.ventas);
      setTotalRegistros(resultado.totalRegistros);
    });
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, clienteTexto, fechaDesde, fechaHasta, orden, page]);

  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / PAGE_SIZE));

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
            <input
              value={clienteInput}
              onChange={(e) => setClienteInput(e.target.value)}
              placeholder='Cliente, "Sin cliente" o Nº de venta...'
              className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTROS_ESTADO.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setEstado(f.value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  estado === f.value
                    ? "bg-primary text-white"
                    : "border border-border bg-bg text-text-dim hover:text-text"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 xs:flex-row sm:items-center">
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="hidden text-text-dim sm:inline">—</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as "MAS_NUEVO" | "MAS_VIEJO")}
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="MAS_NUEVO">Más nuevo primero</option>
              <option value="MAS_VIEJO">Más viejo primero</option>
            </select>
            <button
              type="button"
              onClick={cargar}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-dim hover:text-text"
              aria-label="Actualizar"
            >
              <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-bg/50 text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Ganancia</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-mono text-xs text-text-dim">#{venta.id}</td>
                  <td className="px-4 py-3">
                    {venta.clienteNombre ? (
                      <span className="font-medium text-text">{venta.clienteNombre}</span>
                    ) : (
                      <span className="italic text-text-dim">Sin cliente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-text">
                    {formatoMoneda.format(venta.totalARS)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium text-success">
                      {formatoMoneda.format(venta.gananciaARS)}
                    </span>{" "}
                    <span className="text-xs text-text-dim">
                      {venta.gananciaPorcentaje.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-dim">{formatoFecha.format(new Date(venta.fecha))}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                        ESTADO_STYLE[venta.estado]
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {ESTADO_LABEL[venta.estado]}
                    </span>
                  </td>
                </tr>
              ))}

              {!isPending && ventas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-text-dim">
                    No se encontraron ventas con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          <p className="text-xs text-text-dim">
            {totalRegistros} venta{totalRegistros !== 1 ? "s" : ""}
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
      </div>
    </div>
  );
}