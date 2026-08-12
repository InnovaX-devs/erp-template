import type { KpisDecants } from "@/lib/reportes-decants";

function formatearARS(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

export function KpiCardsDecants({ kpis }: { kpis: KpisDecants }) {
  const cards = [
    { label: "Ingresos por decants", value: formatearARS(kpis.ingresosDecantsARS) },
    { label: "Ventas con decants", value: kpis.cantidadVentasConDecants.toString() },
    { label: "Unidades 5ml vendidas", value: kpis.unidades5ml.toString() },
    { label: "Unidades 10ml vendidas", value: kpis.unidades10ml.toString() },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">
            {card.label}
          </p>
          <p className="mt-2 font-display text-2xl text-ink">{card.value}</p>
        </div>
      ))}
    </div>
  );
}