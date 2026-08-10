"use client";

import { useState } from "react";
import { Package, Tag } from "lucide-react";
import { toast } from "sonner";
import { VentaProvider, useVenta } from "@/components/ventas/venta-context";
import { TogglePrecio } from "@/components/ventas/toggle-precio";
import { BuscadorProducto } from "@/components/ventas/buscador-producto";
import { BuscadorCliente } from "@/components/ventas/buscador-cliente";
import { ModalConsultarPrecio } from "@/components/ventas/modal-consultar-precio";
import type { ProductoBusquedaDTO } from "@/types/producto";

export default function NuevaVentaPage() {
  return (
    <VentaProvider>
      <NuevaVentaContenido />
    </VentaProvider>
  );
}

// Item temporal: guarda qué precio correspondía según el toggle al momento
// de agregarlo, para que #46 (Carrito real) no tenga que recalcular esto.
type ItemTemporal = {
  producto: ProductoBusquedaDTO;
  tipoPrecioAlAgregar: "MINORISTA" | "MAYORISTA";
  precioUnitario: number;
};

function NuevaVentaContenido() {
  const { tipoPrecio } = useVenta();
  const [carritoTemporal, setCarritoTemporal] = useState<ItemTemporal[]>([]);
  const [modalPrecioAbierto, setModalPrecioAbierto] = useState(false);

  function agregarProducto(producto: ProductoBusquedaDTO) {
    const precioUnitario =
      tipoPrecio === "MAYORISTA" && producto.precioMayorista != null
        ? producto.precioMayorista
        : producto.precioVenta;

    setCarritoTemporal((prev) => [
      ...prev,
      { producto, tipoPrecioAlAgregar: tipoPrecio, precioUnitario },
    ]);
    toast.success(`${producto.nombre} agregado (${tipoPrecio === "MAYORISTA" ? "May" : "Min"})`);
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
        <BuscadorCliente />

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
          onClick={() => setModalPrecioAbierto(true)}
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

      {modalPrecioAbierto && <ModalConsultarPrecio onClose={() => setModalPrecioAbierto(false)} />}
    </div>
  );
}