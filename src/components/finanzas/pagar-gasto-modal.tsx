"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { GastoDTO } from "@/types/gasto";
import type { CuentaDTO } from "@/types/cuenta";
import { formatCurrency } from "@/lib/currency";

interface Props {
  gasto: GastoDTO | null;
  cuentas: CuentaDTO[];
  onClose: () => void;
  onSuccess: () => void;
}

export function PagarGastoModal({ gasto, cuentas, onClose, onSuccess }: Props) {
  const [cuentaId, setCuentaId] = useState("");
  const [pagando, setPagando] = useState(false);

  if (!gasto) return null;

  async function confirmar() {
    if (!cuentaId || !gasto) return;
    setPagando(true);
    try {
      const res = await fetch(`/api/gastos/${gasto.id}/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuentaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al pagar el gasto");

      toast.success("Gasto marcado como pagado");
      setCuentaId("");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setPagando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-text">Marcar como pagado</h3>
        <p className="mt-1 text-sm text-text-dim">
          {gasto.concepto} — {formatCurrency(gasto.monto, "ARS")}
        </p>
        <div className="mt-4">
          <label className="block text-xs font-medium text-text-dim">Cuenta de origen *</label>
          <select
            value={cuentaId}
            onChange={(e) => setCuentaId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
          >
            <option value="">Seleccionar cuenta...</option>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} — {c.tipo.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-dim hover:bg-surface-hover">
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={!cuentaId || pagando}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pagando ? "Guardando..." : "Confirmar pago"}
          </button>
        </div>
      </div>
    </div>
  );
}