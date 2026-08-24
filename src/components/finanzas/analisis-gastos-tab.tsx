"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { SelectorPeriodoAnalisis, type PeriodoAnalisis } from "./selector-periodo-analisis";
import { ComparacionMesCard } from "./comparacion-mes-card";
import { GraficoTortaCategorias } from "./grafico-torta-categorias";
import { Top5GastosCard } from "./top5-gastos-card";
import { GraficoEvolucionMensual } from "./grafico-evolucion-mensual";
import { TablaHistoricoMensual } from "./tabla-historico-mensual";
import type { AnalisisGastosResponse } from "@/types/gasto-analisis";
import { fechaISOAR } from "@/lib/timezone";

function mesActualISO(offset = 0) {
  const hoy = fechaISOAR();
  const [anio, mes] = hoy.split("-").map(Number);

  const fecha = new Date(anio, mes - 1 - offset, 1);

  return `${fecha.getFullYear()}-${String(
    fecha.getMonth() + 1
  ).padStart(2, "0")}`;
}

export function AnalisisGastosTab() {
  const [periodo, setPeriodo] = useState<PeriodoAnalisis>({ modo: "mes", mes: mesActualISO() });
  const [datos, setDatos] = useState<AnalisisGastosResponse | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (periodo.modo === "mes") {
        params.set("modo", "mes");
        params.set("mes", periodo.mes);
      } else {
        params.set("modo", "rango");
        params.set("desde", periodo.desde);
        params.set("hasta", periodo.hasta);
      }
      const res = await fetch(`/api/gastos/analisis?${params.toString()}`);
      if (!res.ok) throw new Error();
      setDatos(await res.json());
    } catch {
      toast.error("No se pudo cargar el análisis de gastos");
    } finally {
      setCargando(false);
    }
  }, [periodo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div className="space-y-4">
      <SelectorPeriodoAnalisis periodo={periodo} onChange={setPeriodo} />

      {cargando || !datos ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-dim">
          Cargando...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <ComparacionMesCard comparacion={datos.comparacion} />
            <Top5GastosCard gastos={datos.top5} />
          </div>

          <GraficoTortaCategorias datos={datos.porCategoria} />
          <GraficoEvolucionMensual datos={datos.evolucionMensual} />
          <TablaHistoricoMensual datos={datos.historicoMensual} />
        </>
      )}
    </div>
  );
}