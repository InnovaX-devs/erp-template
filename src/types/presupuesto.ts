import type { Moneda } from "@/lib/currency";

export type ProductoBusqueda = {
  id: number;
  nombre: string;
  codigoBarras: string | null;
  precioVenta: number; // minorista
  precioMayorista: number | null;
  monedaPrecio: Moneda;
  stockActual: number;
  seVendePorDecant: boolean;
  marca: { nombre: string } | null;
};

export type ClienteBusqueda = {
  id: number;
  nombre: string;
  apellido: string | null;
  esMayorista: boolean;
};

export type ItemPresupuestoLocal = {
  key: string;
  productoId: number | null;
  descripcion: string;
  presentacion: "FRASCO" | "DECANT_5ML" | "DECANT_10ML";
  tipoPrecio: "MINORISTA" | "MAYORISTA";
  cantidad: number;
  precioUnitario: number; // siempre en ARS, ya convertido con toArs()
};