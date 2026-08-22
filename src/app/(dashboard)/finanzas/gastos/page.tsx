// app/gastos/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TarjetasResumenGastos } from "@/components/finanzas/tarjetas-resumen-gastos";
import { FiltrosGastos } from "@/components/finanzas/filtros-gastos";
import { TablaGastos } from "@/components/finanzas/tabla-gastos";
import { GastoFormModal } from "@/components/finanzas/gasto-form-modal";
import { AnalisisGastosTab } from "@/components/finanzas/analisis-gastos-tab";
import type { GastoDTO } from "@/types/gasto";

type Pestana = "listado" | "analisis";

export default function GastosPage() {
  const [pestana, setPestana] = useState<Pestana>("listado");
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
    if (pestana === "listado") cargarGastos();
  }, [pestana, cargarGastos]);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Gastos</h1>
          <p className="text-sm text-text-dim">{gastos.length} gastos registrados</p>
        </div>
        {pestana === "listado" && (
          <button
            onClick={() => setModalFormAbierto(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#021541] cursor-pointer px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={16} /> Nuevo gasto
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["listado", "analisis"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setPestana(tab)}
            className={`px-4 py-2 text-sm font-medium ${
              pestana === tab
                ? "border-b-2 border-primary text-primary"
                : "text-text-dim hover:text-text"
            }`}
          >
            {tab === "listado" ? "Listado" : "Análisis"}
          </button>
        ))}
      </div>

      {pestana === "listado" ? (
        <>
          <TarjetasResumenGastos resumen={resumen} />
          <div className="rounded-xl border border-border bg-surface p-4">
            <FiltrosGastos q={q} onChangeQ={setQ} />
          </div>
          {cargando ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-dim">
              Cargando...
            </div>
          ) : (
            <TablaGastos gastos={gastos} />
          )}
          <GastoFormModal
            isOpen={modalFormAbierto}
            onClose={() => setModalFormAbierto(false)}
            onSuccess={cargarGastos}
          />
        </>
      ) : (
        <AnalisisGastosTab />
      )}
    </div>
  );
}