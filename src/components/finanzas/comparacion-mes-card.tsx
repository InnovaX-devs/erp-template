// components/finanzas/comparacion-mes-card.tsx
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ComparacionMesDTO } from "@/types/gasto-analisis";

function formatoARS(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export function ComparacionMesCard({ comparacion }: { comparacion: ComparacionMesDTO | null }) {
  if (!comparacion) return null;

  const { totalActual, monto, porcentaje, sinDatosPrevios, mesAnterior } = comparacion;
  const subio = monto > 0;
  const Icono = sinDatosPrevios ? Minus : subio ? TrendingUp : TrendingDown;
  const color = sinDatosPrevios ? "text-text-dim" : subio ? "text-red-500" : "text-green-500";

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm text-text-dim">Total del mes</p>
      <p className="mt-1 text-2xl font-semibold text-text">{formatoARS(totalActual)}</p>
      <div className={`mt-2 flex items-center gap-1.5 text-sm ${color}`}>
        <Icono size={16} />
        {sinDatosPrevios && porcentaje === null ? (
          <span>Sin datos del mes anterior ({mesAnterior})</span>
        ) : (
          <span>
            {monto >= 0 ? "+" : ""}
            {formatoARS(monto)} ({porcentaje !== null ? `${porcentaje >= 0 ? "+" : ""}${porcentaje.toFixed(1)}%` : "0%"}) vs{" "}
            {mesAnterior}
          </span>
        )}
      </div>
    </div>
  );
}