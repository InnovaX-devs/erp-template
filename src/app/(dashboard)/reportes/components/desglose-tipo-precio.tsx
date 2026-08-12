import { formatCurrency } from "@/lib/currency";
import type { DesgloseTipoPrecioItem } from "@/types/reporte";

const LABELS: Record<DesgloseTipoPrecioItem["tipoPrecio"], string> = {
  MINORISTA: "Minorista",
  MAYORISTA: "Mayorista",
};

const COLORES: Record<DesgloseTipoPrecioItem["tipoPrecio"], string> = {
  MINORISTA: "bg-primary",
  MAYORISTA: "bg-amber",
};

export function DesgloseTipoPrecio({ items }: { items: DesgloseTipoPrecioItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-text">Minorista vs Mayorista</h2>

      <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-full bg-bg">
        {items.map((item) => (
          <div
            key={item.tipoPrecio}
            className={COLORES[item.tipoPrecio]}
            style={{ width: `${item.porcentaje}%` }}
            title={`${LABELS[item.tipoPrecio]}: ${item.porcentaje.toFixed(1)}%`}
          />
        ))}
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.tipoPrecio} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-dim">
              <span className={`h-2.5 w-2.5 rounded-full ${COLORES[item.tipoPrecio]}`} />
              {LABELS[item.tipoPrecio]}
              <span className="text-xs">({item.cantidadVentas} ventas)</span>
            </span>
            <span className="font-medium text-text">
              {formatCurrency(item.montoARS, "ARS")} · {item.porcentaje.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}