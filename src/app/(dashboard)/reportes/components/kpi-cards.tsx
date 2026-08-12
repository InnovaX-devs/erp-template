import { formatCurrency } from "@/lib/currency";
import type { ReporteKPIs } from "@/types/reporte";

export function KpiCards({ kpis }: { kpis: ReporteKPIs }) {
  const items: { label: string; value: string; sub?: string }[] = [
    { label: "Ingresos", value: formatCurrency(kpis.ingresosARS, "ARS") },
    {
      label: "Ganancia neta",
      value: formatCurrency(kpis.gananciaNetaARS, "ARS"),
      sub: `${kpis.margenPorcentaje.toFixed(1)}% margen`,
    },
    { label: "Egresos", value: formatCurrency(kpis.egresosARS, "ARS") },
    { label: "Cantidad de ventas", value: kpis.cantidadVentas.toString() },
    { label: "Ítems vendidos", value: kpis.itemsVendidos.toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">{item.label}</p>
          <p className="mt-1 text-xl font-semibold text-text">{item.value}</p>
          {item.sub && <p className="mt-0.5 text-xs text-success">{item.sub}</p>}
        </div>
      ))}
    </div>
  );
}