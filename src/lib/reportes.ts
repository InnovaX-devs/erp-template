import type { TipoCuenta } from "@prisma/client";
import type {
  DesgloseMetodoCobroItem,
  DesgloseTipoPrecioItem,
  ReporteKPIs,
  ReportePorCuentaItem,
} from "@/types/reporte";

// --- Tipos de entrada ya "aplanados" desde Prisma (ver queries.ts) ---

export type ItemVentaParaReporte = {
  productoId: number | null;
  cantidad: number;
  precioUnitarioUSD: number;
  tipoPrecio: "MINORISTA" | "MAYORISTA";
  costoUnitarioARS: number; // 0 si no hay producto de catálogo (ítem "Varios / Muestra")
};

export type PagoParaReporte = {
  cuentaId: number;
  cuentaNombre: string;
  tipoCuenta: TipoCuenta;
  monto: number;
};

export type VentaParaReporte = {
  id: number;
  totalARS: number;
  totalUSD: number;
  cotizacionUsada: number;
  items: ItemVentaParaReporte[];
  pagos: PagoParaReporte[];
};

export type ReporteCalculado = {
  kpis: ReporteKPIs;
  desgloseTipoPrecio: DesgloseTipoPrecioItem[];
  desgloseMetodoCobro: DesgloseMetodoCobroItem[];
};

/**
 * Busca en el historial (entradas de HistorialPrecio campo COSTO, ordenadas
 * ascendente por fecha) el costo vigente en la fecha de la venta. ItemVenta no
 * guarda un costo "congelado" al momento de vender, así que esto es la mejor
 * aproximación posible con el schema actual. Si no hay historial previo a esa
 * fecha, cae al costo actual del producto.
 */
export function costoHistoricoDelProducto(
  historial: { valorNuevo: number; fecha: Date }[] | undefined,
  costoActual: number,
  fechaVenta: Date
): number {
  if (!historial || historial.length === 0) return costoActual;
  if (historial[0].fecha > fechaVenta) return costoActual;
  let costo = historial[0].valorNuevo;
  for (const entrada of historial) {
    if (entrada.fecha > fechaVenta) break;
    costo = entrada.valorNuevo;
  }
  return costo;
}

export function calcularReporte(ventas: VentaParaReporte[], egresosARS: number): ReporteCalculado {
  let ingresosARS = 0;
  let ingresosUSD = 0;
  let costoVentaARS = 0;
  let itemsVendidos = 0;

  const totalesTipoPrecio: Record<"MINORISTA" | "MAYORISTA", { montoARS: number; ventas: Set<number> }> = {
    MINORISTA: { montoARS: 0, ventas: new Set() },
    MAYORISTA: { montoARS: 0, ventas: new Set() },
  };

  const totalesPorCuenta = new Map<
    number,
    { cuentaNombre: string; tipoCuenta: TipoCuenta; montoARS: number; ventas: Set<number> }
  >();

  for (const venta of ventas) {
    ingresosARS += venta.totalARS;
    ingresosUSD += venta.totalUSD;

    for (const item of venta.items) {
      itemsVendidos += item.cantidad;

      const montoItemARS = item.cantidad * item.precioUnitarioUSD * venta.cotizacionUsada;
      const grupo = totalesTipoPrecio[item.tipoPrecio];
      grupo.montoARS += montoItemARS;
      grupo.ventas.add(venta.id);

      costoVentaARS += item.costoUnitarioARS * item.cantidad;
    }

    for (const pago of venta.pagos) {
      const actual = totalesPorCuenta.get(pago.cuentaId) ?? {
        cuentaNombre: pago.cuentaNombre,
        tipoCuenta: pago.tipoCuenta,
        montoARS: 0,
        ventas: new Set<number>(),
      };
      actual.montoARS += pago.monto;
      actual.ventas.add(venta.id);
      totalesPorCuenta.set(pago.cuentaId, actual);
    }
  }

  const gananciaNetaARS = ingresosARS - egresosARS;
  const margenPorcentaje = ingresosARS > 0 ? (gananciaNetaARS / ingresosARS) * 100 : 0;

  // Los porcentajes usan como denominador la suma de sus propios grupos (no
  // totalARS con descuento incluido), así siempre cierran en exactamente 100%.
  const totalTipoPrecio = totalesTipoPrecio.MINORISTA.montoARS + totalesTipoPrecio.MAYORISTA.montoARS;
  const desgloseTipoPrecio: DesgloseTipoPrecioItem[] = (["MINORISTA", "MAYORISTA"] as const).map((tipo) => ({
    tipoPrecio: tipo,
    montoARS: totalesTipoPrecio[tipo].montoARS,
    cantidadVentas: totalesTipoPrecio[tipo].ventas.size,
    porcentaje: totalTipoPrecio > 0 ? (totalesTipoPrecio[tipo].montoARS / totalTipoPrecio) * 100 : 0,
  }));

  const totalCobros = Array.from(totalesPorCuenta.values()).reduce((a, c) => a + c.montoARS, 0);
  const desgloseMetodoCobro: DesgloseMetodoCobroItem[] = Array.from(totalesPorCuenta.entries())
    .map(([cuentaId, c]) => ({
      cuentaId,
      cuentaNombre: c.cuentaNombre,
      tipoCuenta: c.tipoCuenta,
      montoARS: c.montoARS,
      cantidadVentas: c.ventas.size,
      porcentaje: totalCobros > 0 ? (c.montoARS / totalCobros) * 100 : 0,
    }))
    .sort((a, b) => b.montoARS - a.montoARS);

  return {
    kpis: {
      ingresosARS,
      ingresosUSD,
      costoVentaARS,
      gananciaNetaARS,
      margenPorcentaje,
      egresosARS,
      cantidadVentas: ventas.length,
      itemsVendidos,
    },
    desgloseTipoPrecio,
    desgloseMetodoCobro,
  };
}

export function calcularReportePorCuenta(
  cuentas: { id: number; nombre: string; tipo: TipoCuenta; saldoActual: number }[],
  movimientos: { cuentaId: number; tipo: "INGRESO" | "EGRESO"; monto: number }[]
): ReportePorCuentaItem[] {
  const agregados = new Map<number, { ingresos: number; egresos: number; cantidadMovimientos: number }>();
  for (const m of movimientos) {
    const actual = agregados.get(m.cuentaId) ?? { ingresos: 0, egresos: 0, cantidadMovimientos: 0 };
    if (m.tipo === "INGRESO") actual.ingresos += m.monto;
    else actual.egresos += m.monto;
    actual.cantidadMovimientos += 1;
    agregados.set(m.cuentaId, actual);
  }

  return cuentas.map((c) => {
    const agr = agregados.get(c.id) ?? { ingresos: 0, egresos: 0, cantidadMovimientos: 0 };
    return {
      cuentaId: c.id,
      cuentaNombre: c.nombre,
      tipoCuenta: c.tipo,
      ingresos: agr.ingresos,
      egresos: agr.egresos,
      saldoActual: c.saldoActual,
      cantidadMovimientos: agr.cantidadMovimientos,
    };
  });
}

// --- Rango de fechas por tab ---

export type TabReporte = "diario" | "semanal" | "mensual" | "periodo" | "cuenta";

function inicioDelDia(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
function finDelDia(d: Date) {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}
function inicioDeSemana(d: Date) {
  const r = inicioDelDia(d);
  const dia = r.getDay(); // 0 = domingo
  const diff = dia === 0 ? 6 : dia - 1; // lunes como primer día
  r.setDate(r.getDate() - diff);
  return r;
}
function inicioDeMes(d: Date) {
  const r = inicioDelDia(d);
  r.setDate(1);
  return r;
}

export function rangoParaTab(
  tab: TabReporte,
  desdeParam?: string,
  hastaParam?: string
): { desde: Date; hasta: Date } {
  const ahora = new Date();
  switch (tab) {
    case "diario":
      return { desde: inicioDelDia(ahora), hasta: finDelDia(ahora) };
    case "semanal":
      return { desde: inicioDeSemana(ahora), hasta: finDelDia(ahora) };
    case "mensual":
      return { desde: inicioDeMes(ahora), hasta: finDelDia(ahora) };
    case "periodo":
    case "cuenta":
    default:
      return {
        desde: desdeParam ? inicioDelDia(new Date(desdeParam)) : inicioDeMes(ahora),
        hasta: hastaParam ? finDelDia(new Date(hastaParam)) : finDelDia(ahora),
      };
  }
}