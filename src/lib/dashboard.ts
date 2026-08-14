import type { MonedaPrecio } from "@prisma/client";

interface ItemParaGanancia {
  cantidad: number;
  precioUnitarioUSD: number;
  producto: { precioCosto: number; monedaPrecio: MonedaPrecio } | null;
}

interface VentaParaGanancia {
  cotizacionUsada: number;
  items: ItemParaGanancia[];
}

/**
 * Calcula la ganancia real en ARS de un conjunto de ventas: precio de venta
 * menos costo de cada ítem, usando SIEMPRE la cotizacionUsada de cada venta
 * (no la cotización actual), siguiendo el principio ya establecido en KPIs
 * monetarios del proyecto.
 *
 * Ítems sin producto de catálogo (botón "Varios/Muestra") no tienen costo
 * registrado, así que se computan como ganancia total.
 */
export function calcularGananciaVentas(ventas: VentaParaGanancia[]): number {
  let ganancia = 0;

  for (const venta of ventas) {
    for (const item of venta.items) {
      const ventaItemARS = item.precioUnitarioUSD * item.cantidad * venta.cotizacionUsada;

      const costoItemARS = item.producto
        ? item.producto.monedaPrecio === "USD"
          ? item.producto.precioCosto * item.cantidad * venta.cotizacionUsada
          : item.producto.precioCosto * item.cantidad
        : 0;

      ganancia += ventaItemARS - costoItemARS;
    }
  }

  return ganancia;
}