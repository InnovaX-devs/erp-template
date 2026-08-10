"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface Compra {
  id: number;
  proveedor: { nombre: string } | null;
  tipoPago: "CUENTA" | "EFECTIVO" | "TRANSFERENCIA";
  total: number;
  confirmada: boolean;
  pagada: boolean;
  recibida: boolean;
  cancelada: boolean;
  fecha: string;
}

type FiltroKey =
  | "todas"
  | "pendientes"
  | "sin_pagar"
  | "sin_recibir"
  | "confirmadas"
  | "canceladas";

const FILTROS: { key: FiltroKey; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendientes", label: "Pendientes" },
  { key: "sin_pagar", label: "Sin pagar" },
  { key: "sin_recibir", label: "Sin recibir" },
  { key: "confirmadas", label: "Confirmadas" },
  { key: "canceladas", label: "Canceladas" },
];

const TIPO_PAGO_LABEL: Record<Compra["tipoPago"], string> = {
  CUENTA: "Cuenta",
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
};

// Misma prioridad que usa el filtro en el backend: Cancelada > Confirmada > Pendiente
function estadoDeCompra(compra: Compra): { label: string; className: string } {
  if (compra.cancelada) {
    return { label: "Cancelada", className: "bg-danger/10 text-danger" };
  }
  if (compra.confirmada) {
    return { label: "Confirmada", className: "bg-primary/10 text-primary" };
  }
  return { label: "Pendiente", className: "bg-text-dim/10 text-text-dim" };
}

export function ComprasListado() {
  const [filtro, setFiltro] = useState<FiltroKey>("todas");
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    setError(null);

    const url =
      filtro === "todas" ? "/api/compras" : `/api/compras?filtro=${filtro}`;

    fetch(url)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar las compras");
        setCompras(data.items ?? []);
      })
      .catch((err) => setError(err.message || "Error al cargar las compras"))
      .finally(() => setCargando(false));
  }, [filtro]);

  return (
    <div className="space-y-4">
      {/* Tabs de filtro */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFiltro(f.key)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              filtro === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-text-dim hover:text-text"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-border bg-surface">
        {cargando ? (
          <p className="p-8 text-center text-sm text-text-dim">Cargando...</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-danger">{error}</p>
        ) : compras.length === 0 ? (
          <p className="p-8 text-center text-sm text-text-dim">
            No hay compras para este filtro.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 font-medium">Tipo de pago</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => {
                const estado = estadoDeCompra(compra);
                return (
                  <tr key={compra.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-text">#{compra.id}</td>
                    <td className="px-4 py-3 text-text">
                      {compra.proveedor?.nombre ?? "Sin especificar"}
                    </td>
                    <td className="px-4 py-3 text-text-dim">
                      {TIPO_PAGO_LABEL[compra.tipoPago]}
                    </td>
                    <td className="px-4 py-3 font-medium text-text">
                      {compra.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          estado.className
                        )}
                      >
                        {estado.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-dim">
                      {new Date(compra.fecha).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}