"use client";

import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { listarVentas } from "../actions";
import type { EstadoPago } from "@prisma/client";
import type { FiltroEstado, VentaListItem } from "@/types/venta";
import { Search, ChevronLeft, ChevronRight, RefreshCw, Download, Loader2, X } from "lucide-react";

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
  const [descargando, setDescargando] = useState<number | null>(null);

  const hayFiltrosActivos =
    estado !== "TODOS" || clienteTexto !== "" || fechaDesde !== "" || fechaHasta !== "";

  function limpiarFiltros() {
    setEstado("TODOS");
    setClienteInput("");
    setClienteTexto("");
    setFechaDesde("");
    setFechaHasta("");
    setPage(1);
  }

  async function descargarComprobante(ventaId: number) {
    setDescargando(ventaId);
    try {
      const res = await fetch(`/api/ventas/${ventaId}/comprobante`);
      if (!res.ok) throw new Error("No se pudo generar el comprobante.");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `comprobante-venta-${String(ventaId).padStart(6, "0")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      console.error(err);
    } finally {
      setDescargando(null);
    }
  }

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
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
        <div className="relative min-w-[220px] flex-1">
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
                  : "border border-border bg-surface text-text-dim hover:border-primary/40 hover:text-text"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => {
              setFechaDesde(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-bg px-2 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-text-dim">—</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => {
              setFechaHasta(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-bg px-2 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-primary hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}

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

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="relative hidden overflow-x-auto md:block">
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-surface/60 pt-16 backdrop-blur-[1px]">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          <table className="w-full min-w-[720px] text-sm">
            <thead className="sticky top-0 z-[5]">
              <tr className="bg-ink text-left text-xs font-medium uppercase tracking-wide text-ivory">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Ganancia</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
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
                    <span className="text-xs text-text-dim">{venta.gananciaPorcentaje.toFixed(2)}%</span>
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
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => descargarComprobante(venta.id)}
                      disabled={descargando === venta.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-dim hover:bg-surface-hover hover:text-text disabled:opacity-50"
                      aria-label={`Descargar comprobante de la venta #${venta.id}`}
                    >
                      {descargando === venta.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}

              {!isPending && ventas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-text-dim">
                    No se encontraron ventas con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: tarjetas */}
        <div className="relative divide-y divide-border md:hidden">
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-surface/60 pt-10 backdrop-blur-[1px]">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          {ventas.map((venta) => (
            <div key={venta.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-text-dim">#{venta.id}</p>
                  {venta.clienteNombre ? (
                    <p className="truncate font-medium text-text">{venta.clienteNombre}</p>
                  ) : (
                    <p className="italic text-text-dim">Sin cliente</p>
                  )}
                </div>
                <span
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    ESTADO_STYLE[venta.estado]
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {ESTADO_LABEL[venta.estado]}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono font-semibold text-text">{formatoMoneda.format(venta.totalARS)}</p>
                  <p className="text-xs">
                    <span className="font-mono font-medium text-success">
                      {formatoMoneda.format(venta.gananciaARS)}
                    </span>{" "}
                    <span className="text-text-dim">{venta.gananciaPorcentaje.toFixed(2)}%</span>
                  </p>
                </div>
                <p className="text-xs text-text-dim">{formatoFecha.format(new Date(venta.fecha))}</p>
              </div>

              <button
                type="button"
                onClick={() => descargarComprobante(venta.id)}
                disabled={descargando === venta.id}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-text-dim hover:bg-surface-hover hover:text-text disabled:opacity-50"
              >
                {descargando === venta.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Comprobante
              </button>
            </div>
          ))}

          {!isPending && ventas.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-text-dim">
              No se encontraron ventas con estos filtros.
            </div>
          )}
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