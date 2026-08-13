import { prisma } from "@/lib/prisma";
import {
  calcularReporte,
  calcularReportePorCuenta,
  costoHistoricoDelProducto,
  type VentaParaReporte,
} from "@/lib/reportes";
import type { ReporteData, ReportePorCuentaData } from "@/types/reporte";

export type RangoFechas = { desde: Date; hasta: Date };

// Estados de venta que no representan ingreso real y se excluyen de todos los cálculos.
const ESTADOS_EXCLUIDOS = ["ANULADA", "CANCELADA"] as const;

export async function obtenerReporte(rango: RangoFechas): Promise<ReporteData> {
  const { desde, hasta } = rango;

  const [ventasRaw, config] = await Promise.all([
    prisma.venta.findMany({
      where: {
        fecha: { gte: desde, lte: hasta },
        estadoPago: { notIn: [...ESTADOS_EXCLUIDOS] },
      },
      select: {
        id: true,
        totalARS: true,
        totalUSD: true,
        cotizacionUsada: true,
        fecha: true,
        items: {
          select: {
            productoId: true,
            cantidad: true,
            precioUnitarioUSD: true,
            tipoPrecio: true,
            producto: { select: { id: true, precioCosto: true, monedaPrecio: true } },
          },
        },
        pagos: {
          select: { monto: true, cuenta: { select: { id: true, nombre: true, tipo: true } } },
        },
      },
    }),
    prisma.configuracion.findUnique({ where: { id: "singleton" } }),
  ]);

  const cotizacionActual = config?.cotizacionUSD ?? 1000;

  // Reconstrucción de costo histórico (ver lib/reportes.ts): buscamos, por
  // producto, todas las entradas de HistorialPrecio campo COSTO en el rango
  // relevante y se las pasamos a la función pura de cálculo.
  const productoIds = Array.from(
    new Set(ventasRaw.flatMap((v) => v.items.map((i) => i.productoId).filter((id): id is number => id != null)))
  );
  const historial = productoIds.length
    ? await prisma.historialPrecio.findMany({
        where: { productoId: { in: productoIds }, campo: "COSTO" },
        orderBy: { fecha: "asc" },
        select: { productoId: true, valorNuevo: true, fecha: true },
      })
    : [];
  const historialPorProducto = new Map<number, { valorNuevo: number; fecha: Date }[]>();
  for (const h of historial) {
    const lista = historialPorProducto.get(h.productoId) ?? [];
    lista.push({ valorNuevo: h.valorNuevo, fecha: h.fecha });
    historialPorProducto.set(h.productoId, lista);
  }

  const ventas: VentaParaReporte[] = ventasRaw.map((v) => ({
    id: v.id,
    totalARS: v.totalARS,
    totalUSD: v.totalUSD,
    cotizacionUsada: v.cotizacionUsada,
    items: v.items.map((item) => {
      let costoUnitarioARS = 0;
      if (item.producto) {
        const costoBase = costoHistoricoDelProducto(
          historialPorProducto.get(item.producto.id),
          item.producto.precioCosto,
          v.fecha
        );
        costoUnitarioARS = item.producto.monedaPrecio === "USD" ? costoBase * v.cotizacionUsada : costoBase;
      }
      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitarioUSD: item.precioUnitarioUSD,
        tipoPrecio: item.tipoPrecio,
        costoUnitarioARS,
      };
    }),
    pagos: v.pagos.map((p) => ({
      cuentaId: p.cuenta.id,
      cuentaNombre: p.cuenta.nombre,
      tipoCuenta: p.cuenta.tipo,
      monto: p.monto,
    })),
  }));

  // Egresos del período (gastos, pagos a proveedores, etc). Las cuentas en USD
  // se convierten con la cotización actual: el schema no guarda una cotización
  // histórica por MovimientoCaja.
  const movimientosEgreso = await prisma.movimientoCaja.findMany({
    where: { tipo: "EGRESO", fecha: { gte: desde, lte: hasta } },
    select: { monto: true, cuenta: { select: { tipo: true } } },
  });
  const egresosARS = movimientosEgreso.reduce((acc, m) => {
    const esUSD = m.cuenta.tipo === "EFECTIVO_USD" || m.cuenta.tipo === "BANCO_USD";
    return acc + (esUSD ? m.monto * cotizacionActual : m.monto);
  }, 0);

  const { kpis, desgloseTipoPrecio, desgloseMetodoCobro } = calcularReporte(ventas, egresosARS);

  return {
    fechaInicio: desde.toISOString(),
    fechaFin: hasta.toISOString(),
    kpis,
    desgloseTipoPrecio,
    desgloseMetodoCobro,
  };
}

export async function obtenerReportePorCuenta(rango: RangoFechas): Promise<ReportePorCuentaData> {
  const { desde, hasta } = rango;

  const [cuentas, movimientos] = await Promise.all([
    prisma.cuenta.findMany({
      where: { activa: true },
      select: { id: true, nombre: true, tipo: true, saldoActual: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.movimientoCaja.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      select: { cuentaId: true, tipo: true, monto: true },
    }),
  ]);

  const cuentasResultado = calcularReportePorCuenta(cuentas, movimientos);

  return {
    fechaInicio: desde.toISOString(),
    fechaFin: hasta.toISOString(),
    cuentas: cuentasResultado,
  };
}