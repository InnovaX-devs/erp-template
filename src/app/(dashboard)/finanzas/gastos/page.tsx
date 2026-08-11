"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TarjetasResumenGastos } from "@/components/finanzas/tarjetas-resumen-gastos";
import { FiltrosGastos } from "@/components/finanzas/filtros-gastos";
import { TablaGastos } from "@/components/finanzas/tabla-gastos";
import { GastoFormModal } from "@/components/finanzas/gasto-form-modal";
import type { GastoDTO } from "@/types/gasto";

export default function GastosPage() {
  const [gastos, setGastos] = useState<GastoDTO[]>([]);
  const [resumen, setResumen] = useState({ totalGastos: 0, cajaDisponible: 0 });
  const [q, setQ] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modalFormAbierto, setModalFormAbierto] = useState(false);

  const cargarGastos = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);

      const res = await fetch(`/api/gastos?${params.toString()}`);
      const data = await res.json();
      setGastos(data.items ?? []);
      setResumen(data.resumen);
    } catch {
      toast.error("No se pudieron cargar los gastos");
    } finally {
      setCargando(false);
    }
  }, [q]);

  useEffect(() => {
    cargarGastos();
  }, [cargarGastos]);

  async function eliminarGasto(gasto: GastoDTO) {
    if (!confirm(`¿Eliminar el gasto "${gasto.concepto}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/gastos/${gasto.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo eliminar el gasto");
        return;
      }
      toast.success("Gasto eliminado");
      cargarGastos();
    } catch {
      toast.error("No se pudo eliminar el gasto");
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Gastos</h1>
          <p className="text-sm text-text-dim">{gastos.length} gastos registrados</p>
        </div>
        <button
          onClick={() => setModalFormAbierto(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={16} /> Nuevo gasto
        </button>
      </div>

      <TarjetasResumenGastos resumen={resumen} />

      <div className="rounded-xl border border-border bg-surface p-4">
        <FiltrosGastos q={q} onChangeQ={setQ} />
      </div>

      {cargando ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-dim">
          Cargando...
        </div>
      ) : (
        <TablaGastos gastos={gastos} onEliminar={eliminarGasto} />
      )}

      <GastoFormModal
        isOpen={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        onSuccess={cargarGastos}
      />
    </div>
  );
}