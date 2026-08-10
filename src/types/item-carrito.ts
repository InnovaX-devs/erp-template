import type { ProductoBusquedaDTO } from "./producto";

export type TipoPrecioLinea = "MINORISTA" | "MAYORISTA";

export type ItemCarrito = {
  id: string; // id único de línea, no del producto (por si se agrega 2 veces)
  producto: ProductoBusquedaDTO;
  tipoPrecio: TipoPrecioLinea;
  cantidad: number;
  precioUnitarioArs: number; // siempre en ARS, ya convertido, editable inline
};