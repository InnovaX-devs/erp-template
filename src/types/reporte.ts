import type { TipoCuenta } from "@prisma/client";

export type TipoPeriodoReporte = "DIARIO" | "SEMANAL" | "MENSUAL" | "PERIODO";

export interface ReporteKPIs {
  ingresosARS: number;
  ingresosUSD: number;
  costoVentaARS: number;
  gananciaNetaARS: number;
  margenPorcentaje: number;
  egresosARS: number;
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

export interface ReporteData {
  fechaInicio: string;
  fechaFin: string;
  kpis: ReporteKPIs;
  desgloseTipoPrecio: DesgloseTipoPrecioItem[];
  desgloseMetodoCobro: DesgloseMetodoCobroItem[];
}

export interface ReportePorCuentaItem {
  cuentaId: number;
  cuentaNombre: string;
  tipoCuenta: TipoCuenta;
  ingresos: number;
  egresos: number;
  saldoActual: number;
  cantidadMovimientos: number;
}

export interface ReportePorCuentaData {
  fechaInicio: string;
  fechaFin: string;
  cuentas: ReportePorCuentaItem[];
}

export type ResultadoReporte = { success: true; data: ReporteData } | { success: false; error: string };

export type ResultadoReportePorCuenta =
  | { success: true; data: ReportePorCuentaData }
  | { success: false; error: string };