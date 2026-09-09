export type HistorialPrecioDTO = {
  id: number;
  fecha: string;
  productoId: number;
  producto: { id: number; nombre: string };
  campo: string;
  valorAnterior: number | null;
  valorNuevo: number;
  origen: string;
};

export type HistorialPrecioResponse = {
  items: HistorialPrecioDTO[];
  total: number;
  page: number;
  pageSize: number;
};