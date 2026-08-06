import type { Moneda } from "@/lib/currency";

export type ProductoDTO = {
  id: string;
  nombre: string;
  marca: { nombre: string } | null;
  stockActual: number;
  monedaPrecio: Moneda;
  precioCosto: number;
  precioVenta: number;
  precioMayorista: number | null;
};

export type ProductosSummary = {
  stockCostoArs: number;
  stockVentaArs: number;
  gananciaPotencialArs: number;
};

export type ProductosResponse = {
  items: ProductoDTO[];
  total: number;
  page: number;
  pageSize: number;
  summary: ProductosSummary;
};

export type ProductoBusquedaDTO = {
  id: string;
  nombre: string;
  codigoBarras: string | null;
  stockActual: number;
  monedaPrecio: Moneda;
  precioCosto: number;
  precioVenta: number;
  precioMayorista: number | null;
  seVendePorDecant: boolean;
  marca: { nombre: string } | null;
};