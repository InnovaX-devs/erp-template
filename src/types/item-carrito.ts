import type { ProductoBusquedaDTO } from "./producto";
import type { Presentacion } from "./decant";

export type TipoPrecioLinea = "MINORISTA" | "MAYORISTA";

export type ItemCarrito = {
  id: string;
  producto: ProductoBusquedaDTO;
  tipoPrecio: TipoPrecioLinea;
  cantidad: number;
  precioUnitarioArs: number;
  presentacion: Presentacion;
  abrioFrascoCerrado: boolean;
};