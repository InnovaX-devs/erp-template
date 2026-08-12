// components/finanzas/grafico-evolucion-mensual.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { EvolucionMesDTO } from "@/types/gasto-analisis";

export function GraficoEvolucionMensual({ datos }: { datos: EvolucionMesDTO[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-2 text-sm font-medium text-text">Evolución mensual (últimos 12 meses)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) =>
                typeof value === "number"
                ? value.toLocaleString("es-AR", { style: "currency", currency: "ARS" })
                : value
            }
          />
          <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}