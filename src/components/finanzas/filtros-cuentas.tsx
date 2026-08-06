"use client";

export type FiltroCategoria = "TODAS" | "BANCO" | "EFECTIVO";
export type FiltroMoneda = "ARS_USD" | "ARS" | "USD";

interface Props {
  categoria: FiltroCategoria;
  moneda: FiltroMoneda;
  onCategoriaChange: (c: FiltroCategoria) => void;
  onMonedaChange: (m: FiltroMoneda) => void;
  busqueda: string;
  onBusquedaChange: (q: string) => void;
}

export function FiltrosCuentas({
  categoria,
  moneda,
  onCategoriaChange,
  onMonedaChange,
  busqueda,
  onBusquedaChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={busqueda}
        onChange={(e) => onBusquedaChange(e.target.value)}
        placeholder="Buscar por nombre, alias o banco..."
        className="min-w-[220px] flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-primary focus:outline-none"
      />

      <div className="flex rounded-lg border border-border bg-surface p-0.5">
        {(["TODAS", "BANCO", "EFECTIVO"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategoriaChange(c)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              categoria === c ? "bg-primary text-white" : "text-text-dim hover:text-text"
            }`}
          >
            {c === "TODAS" ? "Todas" : c === "BANCO" ? "Banco" : "Efectivo"}
          </button>
        ))}
      </div>

      <div className="flex rounded-lg border border-border bg-surface p-0.5">
        {(["ARS_USD", "ARS", "USD"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onMonedaChange(m)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              moneda === m ? "bg-primary text-white" : "text-text-dim hover:text-text"
            }`}
          >
            {m === "ARS_USD" ? "ARS+USD" : m}
          </button>
        ))}
      </div>
    </div>
  );
}