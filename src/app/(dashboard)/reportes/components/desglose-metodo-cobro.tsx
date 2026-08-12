import { formatCurrency } from "@/lib/currency";
import type { DesgloseMetodoCobroItem } from "@/types/reporte";

export function DesgloseMetodoCobro({ items }: { items: DesgloseMetodoCobroItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Método de cobro</h2>
        <p className="text-sm text-text-dim">Sin cobros registrados en el período.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-text">Método de cobro</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.cuentaId} className="flex items-center justify-between text-sm">
            <span className="text-text-dim">
              {item.cuentaNombre} <span className="text-xs">({item.cantidadVentas} ventas)</span>
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