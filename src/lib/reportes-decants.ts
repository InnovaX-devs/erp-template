import { Presentacion, type EstadoPago } from "@prisma/client";

export const PRESENTACIONES_DECANT: Presentacion[] = [
  Presentacion.DECANT_5ML,
  Presentacion.DECANT_10ML,
];

export type ItemDecantVenta = {
  id: number;
  presentacion: Presentacion;
  cantidad: number;
  precioUnitarioUSD: number;
  productoNombre: string;
};

export type VentaConDecants = {
  id: number;
  fecha: Date;
  clienteNombre: string | null;
  estadoPago: EstadoPago;
  cotizacionUsada: number;
  itemsDecant: ItemDecantVenta[];
};

/**
 * Ingreso en ARS de los ítems decant de una venta puntual, usando la
 * cotización histórica de ESA venta (Venta.cotizacionUsada), no la
 * cotización actual de Configuracion.
 */
export function calcularIngresoDecantsARS(
  venta: Pick<VentaConDecants, "itemsDecant" | "cotizacionUsada">
): number {
  const totalUSD = venta.itemsDecant.reduce(
    (acc, item) => acc + item.precioUnitarioUSD * item.cantidad,
    0
  );
  return totalUSD * venta.cotizacionUsada;
}

export type KpisDecants = {
  ingresosDecantsARS: number;
  cantidadVentasConDecants: number;
  unidades5ml: number;
  unidades10ml: number;
};

export function calcularKpisDecants(ventas: VentaConDecants[]): KpisDecants {
  let ingresosDecantsARS = 0;
  let unidades5ml = 0;
  let unidades10ml = 0;

  for (const venta of ventas) {
    ingresosDecantsARS += calcularIngresoDecantsARS(venta);

    for (const item of venta.itemsDecant) {
      if (item.presentacion === Presentacion.DECANT_5ML) {
        unidades5ml += item.cantidad;
      } else if (item.presentacion === Presentacion.DECANT_10ML) {
        unidades10ml += item.cantidad;
      }
    }
  }

  return {
    ingresosDecantsARS,
    cantidadVentasConDecants: ventas.length,
    unidades5ml,
    unidades10ml,
  };
}

export function formatearTagDecant(item: ItemDecantVenta): string {
  const ml = item.presentacion === Presentacion.DECANT_5ML ? "5ml" : "10ml";
  return `${item.productoNombre} x${item.cantidad} (${ml})`;
}