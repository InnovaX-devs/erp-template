// components/finanzas/grafico-torta-categorias.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { CategoriaAnalisisDTO } from "@/types/gasto-analisis";

const COLORES = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ef4444", "#14b8a6"];

export function GraficoTortaCategorias({ datos }: { datos: CategoriaAnalisisDTO[] }) {
  if (datos.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface text-sm text-text-dim">
        Sin gastos en el período seleccionado
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-2 text-sm font-medium text-text">Por categoría</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={datos} dataKey="total" nameKey="categoriaNombre" innerRadius={50} outerRadius={90} paddingAngle={2}>
            {datos.map((_, i) => (
              <Cell key={i} fill={COLORES[i % COLORES.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
                typeof value === "number"
                ? value.toLocaleString("es-AR", { style: "currency", currency: "ARS" })
                : value
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}