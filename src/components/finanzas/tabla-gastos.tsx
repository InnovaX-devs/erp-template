"use client";

import { Fragment, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { GastoDTO } from "@/types/gasto";

interface Props {
  gastos: GastoDTO[];
}

export function TablaGastos({ gastos }: Props) {
  const [expandidoId, setExpandidoId] = useState<number | null>(null);

  const toggleExpandido = (id: number) => {
    setExpandidoId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-text-dim">
            <th className="px-4 py-3">Concepto</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Proveedor</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3 text-right">Monto</th>
            <th className="px-4 py-3 text-right">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {gastos.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-text-dim">
                No hay gastos que coincidan con la búsqueda.
              </td>
            </tr>
          )}
          {gastos.map((g) => {
            const abierto = expandidoId === g.id;
            return (
              <Fragment key={g.id}>
                <tr className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text">{g.concepto}</td>
                  <td className="px-4 py-3 text-text-dim">{g.categoria?.nombre ?? "—"}</td>
                  <td className="px-4 py-3 text-text-dim">{g.proveedor?.nombre ?? "—"}</td>
                  <td className="px-4 py-3 text-text-dim">
                    {new Date(g.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-text">
                    {formatCurrency(g.monto, "ARS")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleExpandido(g.id)}
                      className="rounded-lg p-1.5 text-text-dim hover:bg-surface-hover hover:text-text"
                      title={abierto ? "Ocultar detalle" : "Ver detalle"}
                    >
                      {abierto ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </td>
                </tr>
                {abierto && (
                  <tr className="border-b border-border bg-surface-hover/30 last:border-0">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                        <div>
                          <p className="text-text-dim uppercase tracking-wider">Estado</p>
                          <p className="mt-1 font-medium text-text">
                            <span
                              className={
                                g.estadoPago === "PAGADO"
                                  ? "rounded-full bg-success/10 px-2 py-0.5 text-success"
                                  : "rounded-full bg-warning/10 px-2 py-0.5 text-warning"
                              }
                            >
                              {g.estadoPago === "PAGADO" ? "Pagado" : "Pendiente"}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-text-dim uppercase tracking-wider">Cuenta de origen</p>
                          <p className="mt-1 font-medium text-text">
                            {g.cuenta ? `${g.cuenta.nombre} (${g.cuenta.tipo.replace("_", " ")})` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-dim uppercase tracking-wider">Observaciones</p>
                          <p className="mt-1 font-medium text-text">{g.observaciones ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}