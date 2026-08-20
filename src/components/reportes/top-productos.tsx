import { formatCurrency } from "@/lib/currency";
import type { TopProductoItem } from "@/types/reporte";

const LABELS_PRESENTACION: Record<TopProductoItem["presentacion"], string> = {
  FRASCO: "Frasco",
  DECANT_5ML: "Decant 5ml",
  DECANT_10ML: "Decant 10ml",
};

export function TopProductos({ items }: { items: TopProductoItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-text">Top productos</h2>
        <p className="text-sm text-text-dim">Sin ventas de catálogo en el período.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-text">Top productos</h2>
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={`${item.productoId}-${item.presentacion}`} className="flex items-center gap-3">
            <span className="w-4 shrink-0 text-xs font-medium text-text-dim">{i + 1}</span>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-bg">
              {item.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- fotos vienen de storage externo, no vale la pena configurar next/image por esto
                <img src={item.fotoUrl} alt={item.nombre} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-text-dim">
                  Sin foto
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{item.nombre}</p>
              <p className="text-xs text-text-dim">
                {LABELS_PRESENTACION[item.presentacion]} · {item.cantidad} vendidos
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-text">{formatCurrency(item.montoARS, "ARS")}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}