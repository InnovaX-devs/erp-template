import type { TipoCuenta } from "@prisma/client";

export type TipoPeriodoReporte = "DIARIO" | "SEMANAL" | "MENSUAL" | "PERIODO";

export interface ReporteKPIs {
  ingresosARS: number; // COBRADO (suma de montoPagado). Antes era totalARS facturado.
  ingresosFacturadosARS: number; // Informativo: total facturado, cobrado o no.
  ingresosUSD: number;
  costoVentaARS: number; // Prorrateado por lo efectivamente cobrado de cada venta.
  gananciaNetaARS: number; // ingresosARS - costoVentaARS - egresosARS(gastos)
  margenPorcentaje: number;
  egresosARS: number; // SOLO gastos operativos (concepto GASTO). No incluye compras.
  cantidadVentas: number;
  itemsVendidos: number;
}

export interface DesgloseTipoPrecioItem {
  tipoPrecio: "MINORISTA" | "MAYORISTA";
  montoARS: number;
  cantidadVentas: number;
  porcentaje: number;
}

export interface DesgloseMetodoCobroItem {
  cuentaId: number;
  cuentaNombre: string;
  tipoCuenta: TipoCuenta;
  montoARS: number;
  cantidadVentas: number;
  porcentaje: number;
}

export type ResultadoReporte = { success: true; data: ReporteData } | { success: false; error: string };

export interface IngresoPorDia {
  fecha: string; // "yyyy-mm-dd", día calendario dentro del rango seleccionado
  ingresosARS: number; // cobrado, mismo criterio que kpis.ingresosARS
  gananciaARS: number; // ingresosARS - costo - egresos(gastos) del día
  items: number;
}

export interface TopProductoItem {
  productoId: number;
  nombre: string;
  fotoUrl: string | null;
  presentacion: "FRASCO" | "DECANT_5ML" | "DECANT_10ML";
  cantidad: number;
  montoARS: number; // cobrado, prorrateado igual que el resto del reporte
}

export interface ReporteData {
  fechaInicio: string;
  fechaFin: string;
  kpis: ReporteKPIs;
  desgloseTipoPrecio: DesgloseTipoPrecioItem[];
  desgloseMetodoCobro: DesgloseMetodoCobroItem[];
  ingresosPorDia: IngresoPorDia[]; 
  topProductos: TopProductoItem[]; 
}