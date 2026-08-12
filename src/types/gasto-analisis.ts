// types/gasto-analisis.ts
export interface ComparacionMesDTO {
  mesAnterior: string;
  totalActual: number;
  totalAnterior: number;
  monto: number;
  porcentaje: number | null;
  sinDatosPrevios: boolean;
}

export interface CategoriaAnalisisDTO {
  categoriaId: number | null;
  categoriaNombre: string;
  total: number;
  cantidad: number;
}

export interface TopGastoDTO {
  id: number;
  concepto: string;
  monto: number;
  fecha: string;
  categoria: string;
}

export interface EvolucionMesDTO {
  mes: string; // YYYY-MM
  total: number;
}

export interface HistoricoMesDTO {
  mes: string;
  total: number;
  totalAnterior: number;
  monto: number;
  porcentaje: number | null;
  sinDatosPrevios: boolean;
  porCategoria: { categoriaNombre: string; total: number }[];
}

export interface AnalisisGastosResponse {
  periodo: { modo: "mes" | "rango"; inicio: string; fin: string };
  resumen: { total: number; cantidadGastos: number };
  comparacion: ComparacionMesDTO | null;
  porCategoria: CategoriaAnalisisDTO[];
  top5: TopGastoDTO[];
  evolucionMensual: EvolucionMesDTO[];
  historicoMensual: HistoricoMesDTO[];
}