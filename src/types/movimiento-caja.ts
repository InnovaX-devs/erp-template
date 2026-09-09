export type TipoMovimientoCaja = "INGRESO" | "EGRESO";

export type ConceptoMovimientoCaja =
  | "VENTA_COBRADA"
  | "PAGO_DEUDA_CLIENTE"
  | "PAGO_A_PROVEEDOR"
  | "GASTO"
  | "OTRO"
  | "AJUSTE_SALDO"
  | "TRANSFERENCIA";

export type MovimientoCajaDTO = {
  id: number;
  cuentaId: number;
  cuenta: { id: number; nombre: string; tipo: string };
  tipo: TipoMovimientoCaja;
  concepto: ConceptoMovimientoCaja;
  monto: number;
  saldoResultante: number;
  detalle: string | null;
  fecha: string;
  ventaId: number | null;
  gastoId: number | null;
  compraId: number | null;
};

export const ETIQUETAS_CONCEPTO: Record<ConceptoMovimientoCaja, string> = {
  VENTA_COBRADA: "Venta cobrada",
  PAGO_DEUDA_CLIENTE: "Pago deuda cliente",
  PAGO_A_PROVEEDOR: "Pago a proveedor",
  GASTO: "Gasto",
  OTRO: "Otro",
  AJUSTE_SALDO: "Ajuste de saldo",
  TRANSFERENCIA: "Transferencia",
};