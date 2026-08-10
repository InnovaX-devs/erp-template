export type ProductoBusqueda = {
  id: number;
  nombre: string;
  codigoBarras: string | null;
  precioVenta: number; // minorista
  precioMayorista: number | null;
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
  key: string; // uuid local, no id de DB todavía
  productoId: number | null;
  descripcion: string;
  presentacion: "FRASCO" | "DECANT_5ML" | "DECANT_10ML";
  tipoPrecio: "MINORISTA" | "MAYORISTA";
  cantidad: number;
  precioUnitario: number;
};