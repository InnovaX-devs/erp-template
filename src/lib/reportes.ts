import type { TipoCuenta } from "@prisma/client";
import type {
  DesgloseMetodoCobroItem,
  DesgloseTipoPrecioItem,
  IngresoPorDia,
  ReporteKPIs,
  TopProductoItem,
} from "@/types/reporte";

// --- Tipos de entrada ya "aplanados" desde Prisma (ver queries.ts) ---

export type ItemVentaParaReporte = {
  productoId: number | null;
  cantidad: number;
  precioUnitarioUSD: number;
  tipoPrecio: "MINORISTA" | "MAYORISTA";
  costoUnitarioARS: number;
  presentacion: "FRASCO" | "DECANT_5ML" | "DECANT_10ML"; // NUEVO
  nombreProducto: string | null; // NUEVO — null si es ítem "Varios/Muestra"
  fotoUrl: string | null; // NUEVO
};

export type VentaParaReporte = {
  id: number;
  fecha: Date; // NUEVO — necesario para agrupar por día
  totalARS: number;
  totalUSD: number;
  montoPagado: number;
  cotizacionUsada: number;
  items: ItemVentaParaReporte[];
  pagos: PagoParaReporte[];
};

export type PagoParaReporte = {
  cuentaId: number;
  cuentaNombre: string;
  tipoCuenta: TipoCuenta;
  monto: number;
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

/**
 * egresosGastosARS: SOLO movimientos de caja con concepto GASTO. No incluye
 * pagos a proveedores (eso es conversión de efectivo en stock, no una pérdida
 * del período) — esos se reflejan aparte en calcularFlujoCaja.
 */
export function calcularReporte(ventas: VentaParaReporte[], egresosGastosARS: number): ReporteCalculado {
  let ingresosARS = 0; // cobrado
  let ingresosFacturadosARS = 0; // facturado (informativo)
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
    ingresosFacturadosARS += venta.totalARS;
    ingresosARS += venta.montoPagado;
    ingresosUSD += venta.totalUSD;

    // Proporción de la venta que efectivamente se cobró (0 a 1, con clamp por
    // las dudas de redondeos). Se usa para reconocer ingreso/costo/desglose
    // solo por la parte que realmente entró — así una venta A_CUENTA pagada a
    // la mitad no infla el resultado con plata que todavía no cobraste.
    const proporcionCobrada = venta.totalARS > 0 ? Math.min(venta.montoPagado / venta.totalARS, 1) : 0;

    // Precio de lista (sin descuento) de todos los ítems de la venta, para
    // poder prorratear el descuento global de la venta a nivel ítem.
    const montoListaVentaARS = venta.items.reduce(
      (acc, item) => acc + item.cantidad * item.precioUnitarioUSD * venta.cotizacionUsada,
      0
    );
    // Factor que absorbe el descuento: precio real facturado / precio de lista.
    // Sin descuento, factor = 1. Si no hay monto de lista (caso borde), no corrige.
    const factorDescuento = montoListaVentaARS > 0 ? venta.totalARS / montoListaVentaARS : 1;

    for (const item of venta.items) {
      itemsVendidos += item.cantidad;

      const montoListaItemARS = item.cantidad * item.precioUnitarioUSD * venta.cotizacionUsada;
      const montoItemConDescuentoARS = montoListaItemARS * factorDescuento;

      const grupo = totalesTipoPrecio[item.tipoPrecio];
      // El desglose solo refleja lo efectivamente cobrado, igual que ingresosARS.
      grupo.montoARS += montoItemConDescuentoARS * proporcionCobrada;
      grupo.ventas.add(venta.id);

      // El costo también se reconoce proporcional a lo cobrado.
      costoVentaARS += item.costoUnitarioARS * item.cantidad * proporcionCobrada;
    }

    for (const pago of venta.pagos) {
      // Los pagos ya son plata real cobrada: no llevan descuento ni prorrateo.
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

  const gananciaNetaARS = ingresosARS - costoVentaARS - egresosGastosARS;
  const margenPorcentaje = ingresosARS > 0 ? (gananciaNetaARS / ingresosARS) * 100 : 0;

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
      ingresosFacturadosARS,
      ingresosUSD,
      costoVentaARS,
      gananciaNetaARS,
      margenPorcentaje,
      egresosARS: egresosGastosARS,
      cantidadVentas: ventas.length,
      itemsVendidos,
    },
    desgloseTipoPrecio,
    desgloseMetodoCobro,
  };
}

// --- Rango de fechas por tab (sin cambios) ---

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
  const dia = r.getDay();
  const diff = dia === 0 ? 6 : dia - 1;
  r.setDate(r.getDate() - diff);
  return r;
}
function inicioDeMes(d: Date) {
  const r = inicioDelDia(d);
  r.setDate(1);
  return r;
}

/** Parsea "yyyy-mm-dd" como fecha LOCAL. A diferencia de `new Date(str)`,
 * que interpreta un string sin hora como medianoche UTC y puede devolver
 * el día anterior en husos negativos como Argentina (UTC-3). */
function parseFechaLocal(fechaStr: string): Date {
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
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
        desde: desdeParam ? inicioDelDia(parseFechaLocal(desdeParam)) : inicioDeMes(ahora),
        hasta: hastaParam ? finDelDia(parseFechaLocal(hastaParam)) : finDelDia(ahora),
      };
  }
}

/** Clave "yyyy-mm-dd" en hora local, para agrupar por día calendario. */
export function claveFecha(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Ingresos/ganancia/ítems por día calendario dentro de [desde, hasta].
 * Incluye días sin ventas con valores en cero, así el gráfico no salta fechas.
 * Usa el mismo criterio "cobrado" que calcularReporte: ingresosARS = suma de
 * montoPagado (no hay fecha de pago en el schema, así que el pago se atribuye
 * al día de la venta, igual que en el resto del reporte).
 */
export function calcularIngresosPorDia(
  ventas: VentaParaReporte[],
  egresosGastosPorDiaARS: Map<string, number>,
  desde: Date,
  hasta: Date
): IngresoPorDia[] {
  const porDia = new Map<string, { ingresosARS: number; costoARS: number; items: number }>();

  const cursor = new Date(desde);
  cursor.setHours(0, 0, 0, 0);
  const fin = new Date(hasta);
  fin.setHours(0, 0, 0, 0);
  while (cursor <= fin) {
    porDia.set(claveFecha(cursor), { ingresosARS: 0, costoARS: 0, items: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const venta of ventas) {
    const clave = claveFecha(venta.fecha);
    const bucket = porDia.get(clave) ?? { ingresosARS: 0, costoARS: 0, items: 0 };
    const proporcionCobrada = venta.totalARS > 0 ? Math.min(venta.montoPagado / venta.totalARS, 1) : 0;

    bucket.ingresosARS += venta.montoPagado;
    for (const item of venta.items) {
      bucket.items += item.cantidad;
      bucket.costoARS += item.costoUnitarioARS * item.cantidad * proporcionCobrada;
    }
    porDia.set(clave, bucket);
  }

  return Array.from(porDia.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([fecha, v]) => ({
      fecha,
      ingresosARS: v.ingresosARS,
      gananciaARS: v.ingresosARS - v.costoARS - (egresosGastosPorDiaARS.get(fecha) ?? 0),
      items: v.items,
    }));
}

/**
 * Ranking de productos por monto cobrado, agrupado por (producto, presentación).
 * Los ítems "Varios / Muestra" (sin productoId) quedan afuera: no tienen
 * catálogo, foto ni nombre para mostrar en el ranking.
 */
export function calcularTopProductos(ventas: VentaParaReporte[], limite = 10): TopProductoItem[] {
  const acumulado = new Map<string, TopProductoItem>();

  for (const venta of ventas) {
    const proporcionCobrada = venta.totalARS > 0 ? Math.min(venta.montoPagado / venta.totalARS, 1) : 0;
    const montoListaVentaARS = venta.items.reduce(
      (acc, item) => acc + item.cantidad * item.precioUnitarioUSD * venta.cotizacionUsada,
      0
    );
    const factorDescuento = montoListaVentaARS > 0 ? venta.totalARS / montoListaVentaARS : 1;

    for (const item of venta.items) {
      if (item.productoId == null) continue;

      const clave = `${item.productoId}-${item.presentacion}`;
      const montoListaItemARS = item.cantidad * item.precioUnitarioUSD * venta.cotizacionUsada;
      const montoItemARS = montoListaItemARS * factorDescuento * proporcionCobrada;

      const actual = acumulado.get(clave) ?? {
        productoId: item.productoId,
        nombre: item.nombreProducto ?? "(producto sin nombre)",
        fotoUrl: item.fotoUrl,
        presentacion: item.presentacion,
        cantidad: 0,
        montoARS: 0,
      };
      actual.cantidad += item.cantidad;
      actual.montoARS += montoItemARS;
      acumulado.set(clave, actual);
    }
  }

  return Array.from(acumulado.values())
    .sort((a, b) => b.montoARS - a.montoARS)
    .slice(0, limite);
}