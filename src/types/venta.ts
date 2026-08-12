import type { EstadoPago } from "@prisma/client";

export type VentaListItem = {
  id: number;
  clienteNombre: string | null; // null => "Sin cliente"
  totalARS: number;
  gananciaARS: number;
  gananciaPorcentaje: number; // sobre el costo, no sobre el total
  fecha: string; // ISO
  estado: EstadoPago;
};

export type FiltroEstado = "TODOS" | EstadoPago;

export type FiltrosVentas = {
  estado: FiltroEstado;
  clienteTexto: string;
  fechaDesde: string | null; // yyyy-mm-dd
  fechaHasta: string | null; // yyyy-mm-dd
  orden: "MAS_NUEVO" | "MAS_VIEJO";
  page: number;
  pageSize: number;
};

export type ResultadoListadoVentas = {
  ventas: VentaListItem[];
  totalRegistros: number;
};

export type PedidoListItem = {
  id: number;
  clienteNombre: string | null;
  totalARS: number;
  montoPagado: number;
  estadoPago: EstadoPago;
  armado: boolean;
  enviado: boolean;
  retirado: boolean;
  fecha: string; // ISO
};

export type FiltrosPedidos = {
  clienteTexto: string;
  fechaDesde: string | null;
  fechaHasta: string | null;
  orden: "MAS_NUEVO" | "MAS_VIEJO";
  sinCobrar: boolean;
  sinArmar: boolean;
  sinEnviar: boolean;
  sinRetirar: boolean;
};

export type ResultadoListadoPedidos = {
  pedidos: PedidoListItem[];
};