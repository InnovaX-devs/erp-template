import { formatCurrency } from "@/lib/currency";
import type { TopClienteItem } from "@/types/reporte";

export function TopClientes({ items }: { items: TopClienteItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Top clientes</h2>
        <p className="text-sm text-text-dim">Sin ventas a clientes registrados en el período.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-text">Top clientes</h2>
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={item.clienteId} className="flex items-center gap-3">
            <span className="w-4 shrink-0 text-xs font-medium text-text-dim">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{item.nombre}</p>
              <p className="text-xs text-text-dim">{item.cantidadVentas} compras</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-text">{formatCurrency(item.montoARS, "ARS")}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
