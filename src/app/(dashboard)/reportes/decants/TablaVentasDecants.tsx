import type { EstadoPago } from "@prisma/client";
import type { VentaDecantListado } from "./queries";

function formatearARS(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

// CANCELADA no tiene filtro dedicado en el issue, pero puede aparecer bajo
// "Todos" — le doy estilo/label igual para no romper si llega a pasar.
const ESTADO_STYLES: Record<EstadoPago, string> = {
  PAGADA: "text-success",
  A_CUENTA: "text-amber",
  ANULADA: "text-danger",
  CANCELADA: "text-danger",
};

const ESTADO_LABELS: Record<EstadoPago, string> = {
  PAGADA: "Pagada",
  A_CUENTA: "A cuenta",
  ANULADA: "Anulada",
  CANCELADA: "Cancelada",
};

export function TablaVentasDecants({ ventas }: { ventas: VentaDecantListado[] }) {
  if (ventas.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-text-dim">
        No hay ventas con decants para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-dim">
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Ítems</th>
            <th className="px-4 py-3">Ingreso decants</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 text-text">{formatearFecha(venta.fecha)}</td>
              <td className="px-4 py-3 text-text">{venta.clienteNombre ?? "Consumidor final"}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {venta.tags.map((tag, i) => (
                    <span key={i} className="rounded-full bg-ink/5 px-2 py-1 text-xs text-text-dim">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-text">
                {formatearARS(venta.ingresoDecantsARS)}
              </td>
              <td className={`px-4 py-3 font-medium ${ESTADO_STYLES[venta.estadoPago]}`}>
                {ESTADO_LABELS[venta.estadoPago]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}