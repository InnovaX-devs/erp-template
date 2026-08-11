export type EstadoPagoGasto = "PENDIENTE" | "PAGADO";

export interface GastoDTO {
  id: number;
  monto: number;
  concepto: string;
  observaciones: string | null;
  estadoPago: EstadoPagoGasto;
  fecha: string;
  categoria: { id: number; nombre: string } | null;
  proveedor: { id: number; nombre: string } | null;
  cuenta: { id: number; nombre: string; tipo: string } | null;
}

export interface CategoriaGastoDTO {
  id: number;
  nombre: string;
}