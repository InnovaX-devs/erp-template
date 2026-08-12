// components/finanzas/tabla-historico-mensual.tsx
import type { HistoricoMesDTO } from "@/types/gasto-analisis";

function formatoARS(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export function TablaHistoricoMensual({ datos }: { datos: HistoricoMesDTO[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-dim">
            <th className="p-3 font-medium">Mes</th>
            <th className="p-3 font-medium">Total</th>
            <th className="p-3 font-medium">Variación</th>
            <th className="p-3 font-medium">Principales categorías</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((m) => (
            <tr key={m.mes} className="border-b border-border last:border-0">
              <td className="p-3 text-text">{m.mes}</td>
              <td className="p-3 text-text">{formatoARS(m.total)}</td>
              <td className="p-3">
                {m.sinDatosPrevios && m.porcentaje === null ? (
                  <span className="text-text-dim">Sin datos previos</span>
                ) : (
                  <span className={m.monto > 0 ? "text-red-500" : m.monto < 0 ? "text-green-500" : "text-text-dim"}>
                    {m.monto >= 0 ? "+" : ""}
                    {m.porcentaje !== null ? `${m.porcentaje.toFixed(1)}%` : "0%"}
                  </span>
                )}
              </td>
              <td className="p-3 text-text-dim">
                {m.porCategoria
                  .slice(0, 3)
                  .map((c) => `${c.categoriaNombre} (${formatoARS(c.total)})`)
                  .join(", ") || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}