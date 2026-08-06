"use client";

import { useState } from "react";
import { Package, Tag } from "lucide-react";
import { toast } from "sonner";
import { VentaProvider } from "@/components/ventas/venta-context";
import { TogglePrecio } from "@/components/ventas/toggle-precio";
import { BuscadorProducto } from "@/components/ventas/buscador-producto";
import type { ProductoBusquedaDTO } from "@/types/producto";

export default function NuevaVentaPage() {
  return (
    <VentaProvider>
      <NuevaVentaContenido />
    </VentaProvider>
  );
}

function NuevaVentaContenido() {
  const [carritoTemporal, setCarritoTemporal] = useState<ProductoBusquedaDTO[]>([]);

  function agregarProducto(producto: ProductoBusquedaDTO) {
    // El carrito real se arma en el issue #46 (Carrito de Venta).
    setCarritoTemporal((prev) => [...prev, producto]);
    toast.success(`${producto.nombre} agregado`);
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
        {/* TODO: BuscadorCliente - depende del issue de Clientes de otro compañero */}
        <div className="flex-1 min-w-[220px] rounded-lg border border-dashed border-border px-3 py-2 text-sm text-text-dim">
          Buscador de cliente (pendiente)
        </div>

        <BuscadorProducto onSeleccionar={agregarProducto} />
        <TogglePrecio />

        <button
          type="button"
          onClick={() => toast.info("Varios / Muestra: próximamente")}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-surface-hover"
        >
          <Package size={14} /> Varios / Muestra
        </button>
        <button
          type="button"
          onClick={() => toast.info("Consultar precio: próximamente")}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-surface-hover"
        >
          <Tag size={14} /> Consultar precio
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-dim">
        {carritoTemporal.length === 0
          ? "Carrito vacío. Buscá un producto para agregarlo."
          : `${carritoTemporal.length} producto(s) seleccionados (el carrito real se arma en #46)`}
      </div>
    </div>
  );
}