import type { ProductoBusquedaDTO } from "./producto";

export type TipoPrecioLinea = "MINORISTA" | "MAYORISTA";

export type ItemCarrito = {
  id: string;
  producto: ProductoBusquedaDTO;
  tipoPrecio: TipoPrecioLinea;
  cantidad: number;
  precioUnitarioArs: number;
};