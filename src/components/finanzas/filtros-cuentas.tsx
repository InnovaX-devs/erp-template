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
  usaCotizacionUSD?: boolean;
}

export function FiltrosCuentas({
  categoria,
  moneda,
  onCategoriaChange,
  onMonedaChange,
  busqueda,
  onBusquedaChange,
  usaCotizacionUSD = false,
}: Props) {
  return (
    <div className="space-y-2">
      <input
        value={busqueda}
        onChange={(e) => onBusquedaChange(e.target.value)}
        placeholder="Buscar por nombre, alias o banco..."
        className="w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] placeholder:text-[#45464f] focus:outline-none focus:ring-1 focus:ring-[#021541]"
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-[#c5c6d0] bg-white p-0.5">
          {(["TODAS", "BANCO", "EFECTIVO"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategoriaChange(c)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                categoria === c
                  ? "bg-[#021541] text-white cursor-default"
                  : "text-[#45464f] hover:text-[#191c1e] cursor-pointer"
              }`}
            >
              {c === "TODAS" ? "Todas" : c === "BANCO" ? "Banco" : "Efectivo"}
            </button>
          ))}
        </div>

        {usaCotizacionUSD && (
          <div className="flex rounded-lg border border-[#c5c6d0] bg-white p-0.5">
            {(["ARS_USD", "ARS", "USD"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onMonedaChange(m)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  moneda === m
                    ? "bg-[#021541] text-white cursor-default"
                    : "text-[#45464f] hover:text-[#191c1e] cursor-pointer"
                }`}
              >
                {m === "ARS_USD" ? "ARS+USD" : m}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}