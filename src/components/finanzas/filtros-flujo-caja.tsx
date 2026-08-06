"use client";

import type { CuentaDTO } from "@/types/cuenta";
import { ETIQUETAS_CONCEPTO, type ConceptoMovimientoCaja } from "@/types/movimiento-caja";

export type PeriodoRapido = "HOY" | "SEMANA" | "MES" | "PERSONALIZADO";

export interface FiltrosFlujo {
  periodoRapido: PeriodoRapido;
  desde: string;
  hasta: string;
  tipo: "" | "INGRESO" | "EGRESO";
  cuentaId: string;
  concepto: "" | ConceptoMovimientoCaja;
}

interface Props {
  filtros: FiltrosFlujo;
  onChange: (filtros: FiltrosFlujo) => void;
  cuentas: CuentaDTO[];
}

function calcularRango(periodo: PeriodoRapido): { desde: string; hasta: string } {
  const hoy = new Date();
  const hastaStr = hoy.toISOString().slice(0, 10);

  if (periodo === "HOY") {
    return { desde: hastaStr, hasta: hastaStr };
  }
  if (periodo === "SEMANA") {
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - hoy.getDay());
    return { desde: inicio.toISOString().slice(0, 10), hasta: hastaStr };
  }
  if (periodo === "MES") {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return { desde: inicio.toISOString().slice(0, 10), hasta: hastaStr };
  }
  return { desde: "", hasta: "" };
}

export function FiltrosFlujoCaja({ filtros, onChange, cuentas }: Props) {
  function setPeriodoRapido(periodo: PeriodoRapido) {
    const rango = calcularRango(periodo);
    onChange({ ...filtros, periodoRapido: periodo, ...rango });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-text-dim">Período:</span>
        {(["HOY", "SEMANA", "MES"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriodoRapido(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filtros.periodoRapido === p
                ? "bg-primary text-white"
                : "bg-surface-hover text-text-dim hover:text-text"
            }`}
          >
            {p === "HOY" ? "Hoy" : p === "SEMANA" ? "Esta semana" : "Este mes"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          value={filtros.desde}
          onChange={(e) => onChange({ ...filtros, periodoRapido: "PERSONALIZADO", desde: e.target.value })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        />
        <input
          type="date"
          value={filtros.hasta}
          onChange={(e) => onChange({ ...filtros, periodoRapido: "PERSONALIZADO", hasta: e.target.value })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        />
        <select
          value={filtros.tipo}
          onChange={(e) => onChange({ ...filtros, tipo: e.target.value as FiltrosFlujo["tipo"] })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        >
          <option value="">Todos los tipos</option>
          <option value="INGRESO">Ingreso</option>
          <option value="EGRESO">Egreso</option>
        </select>
        <select
          value={filtros.cuentaId}
          onChange={(e) => onChange({ ...filtros, cuentaId: e.target.value })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        >
          <option value="">Todas las cuentas</option>
          {cuentas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select
          value={filtros.concepto}
          onChange={(e) => onChange({ ...filtros, concepto: e.target.value as FiltrosFlujo["concepto"] })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        >
          <option value="">Todos los medios</option>
          {Object.entries(ETIQUETAS_CONCEPTO).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}