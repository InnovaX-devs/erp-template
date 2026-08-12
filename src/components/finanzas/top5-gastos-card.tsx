// components/finanzas/top5-gastos-card.tsx
import type { TopGastoDTO } from "@/types/gasto-analisis";

export function Top5GastosCard({ gastos }: { gastos: TopGastoDTO[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-2 text-sm font-medium text-text">Top 5 gastos</h3>
      {gastos.length === 0 ? (
        <p className="text-sm text-text-dim">Sin gastos en el período seleccionado</p>
      ) : (
        <ul className="divide-y divide-border">
          {gastos.map((g) => (
            <li key={g.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="text-text">{g.concepto}</p>
                <p className="text-xs text-text-dim">
                  {g.categoria} · {new Date(g.fecha).toLocaleDateString("es-AR")}
                </p>
              </div>
              <span className="font-medium text-text">
                {g.monto.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}