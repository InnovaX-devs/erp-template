// (dashboard)/reportes/queries.ts
import { prisma } from "@/lib/prisma";
import {
  calcularReporte,
  calcularIngresosPorDia,
  calcularTopProductos,
  claveFecha,
  costoHistoricoDelProducto,
  enriquecerVentas,
  type VentaParaReporte,
} from "@/lib/reportes";
import type { ReporteData } from "@/types/reporte";

export type RangoFechas = { desde: Date; hasta: Date };

const ESTADOS_EXCLUIDOS = ["ANULADA", "CANCELADA"] as const;

const ML_POR_PRESENTACION: Record<"DECANT_5ML" | "DECANT_10ML", number> = {
  DECANT_5ML: 5,
  DECANT_10ML: 10,
};

export async function obtenerReporte(rango: RangoFechas): Promise<ReporteData> {
  const { desde, hasta } = rango;

  const [ventasRaw, config] = await Promise.all([
    prisma.venta.findMany({
      where: {
        fecha: { gte: desde, lt: hasta },
        estadoPago: { notIn: [...ESTADOS_EXCLUIDOS] },
      },
      select: {
        id: true,
        totalARS: true,
        totalUSD: true,
        montoPagado: true,
        cotizacionUsada: true,
        fecha: true,
        items: {
          select: {
            productoId: true,
            cantidad: true,
            precioUnitarioUSD: true,
            tipoPrecio: true,
            presentacion: true,
            producto: {
              select: { id: true, nombre: true, fotoUrl: true, precioCosto: true, monedaPrecio: true, contenidoMl: true },
            },
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

  const productoIds = Array.from(
    new Set(ventasRaw.flatMap((v) => v.items.map((i) => i.productoId).filter((id): id is number => id != null)))
  );

  // historial y movimientosEgreso son independientes entre sí -> en paralelo.
  const [historial, movimientosEgreso] = await Promise.all([
    productoIds.length
      ? prisma.historialPrecio.findMany({
          where: { productoId: { in: productoIds }, campo: "COSTO" },
          orderBy: { fecha: "asc" },
          select: { productoId: true, valorNuevo: true, fecha: true },
        })
      : Promise.resolve([]),
    prisma.movimientoCaja.findMany({
      where: { tipo: "EGRESO", concepto: "GASTO", fecha: { gte: desde, lt: hasta } },
      select: { monto: true, fecha: true, cuenta: { select: { tipo: true } } },
    }),
  ]);

  const historialPorProducto = new Map<number, { valorNuevo: number; fecha: Date }[]>();
  for (const h of historial) {
    const lista = historialPorProducto.get(h.productoId) ?? [];
    lista.push({ valorNuevo: h.valorNuevo, fecha: h.fecha });
    historialPorProducto.set(h.productoId, lista);
  }

  const ventas: VentaParaReporte[] = ventasRaw.map((v) => ({
    id: v.id,
    fecha: v.fecha,
    totalARS: v.totalARS,
    totalUSD: v.totalUSD,
    montoPagado: v.montoPagado,
    cotizacionUsada: v.cotizacionUsada,
    items: v.items.map((item) => {
      let costoUnitarioARS = 0;

      if (item.producto) {
        const costoBase = costoHistoricoDelProducto(
          historialPorProducto.get(item.producto.id),
          item.producto.precioCosto,
          v.fecha
        );
        const costoFrascoARS =
          item.producto.monedaPrecio === "USD" ? costoBase * v.cotizacionUsada : costoBase;

        const mlDecant =
          item.presentacion === "DECANT_5ML" || item.presentacion === "DECANT_10ML"
            ? ML_POR_PRESENTACION[item.presentacion]
            : null;

        if (mlDecant && item.producto.contenidoMl) {
          costoUnitarioARS = (costoFrascoARS / item.producto.contenidoMl) * mlDecant;
        } else {
          costoUnitarioARS = costoFrascoARS;
        }
      }

      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitarioUSD: item.precioUnitarioUSD,
        tipoPrecio: item.tipoPrecio,
        presentacion: item.presentacion,
        nombreProducto: item.producto?.nombre ?? null,
        fotoUrl: item.producto?.fotoUrl ?? null,
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

  let egresosGastosARS = 0;
  const egresosGastosPorDiaARS = new Map<string, number>();
  for (const m of movimientosEgreso) {
    const esUSD = m.cuenta.tipo === "EFECTIVO_USD" || m.cuenta.tipo === "BANCO_USD";
    const montoARS = esUSD ? m.monto * cotizacionActual : m.monto;
    egresosGastosARS += montoARS;
    const clave = claveFecha(m.fecha);
    egresosGastosPorDiaARS.set(clave, (egresosGastosPorDiaARS.get(clave) ?? 0) + montoARS);
  }

  // Se calcula UNA sola vez y se reusa en las 3 funciones de abajo.
  const ventasEnriquecidas = enriquecerVentas(ventas);

  const { kpis, desgloseTipoPrecio, desgloseMetodoCobro } = calcularReporte(ventasEnriquecidas, egresosGastosARS);
  const ingresosPorDia = calcularIngresosPorDia(ventasEnriquecidas, egresosGastosPorDiaARS, desde, hasta);
  const topProductos = calcularTopProductos(ventasEnriquecidas);

  return {
    fechaInicio: desde.toISOString(),
    fechaFin: hasta.toISOString(),
    kpis,
    desgloseTipoPrecio,
    desgloseMetodoCobro,
    ingresosPorDia,
    topProductos,
  };
}

// Versión liviana para el dashboard: mismos datos de venta que obtenerReporte,
// pero sin calcular ingresosPorDia ni topProductos (no se usan ahí).
export async function obtenerKpisDelDia(rango: RangoFechas): Promise<{ gananciaNetaARS: number; cantidadVentas: number }> {
  const { desde, hasta } = rango;

  const [ventasRaw, config] = await Promise.all([
    prisma.venta.findMany({
      where: {
        fecha: { gte: desde, lt: hasta },
        estadoPago: { notIn: [...ESTADOS_EXCLUIDOS] },
      },
      select: {
        id: true,
        totalARS: true,
        totalUSD: true,
        montoPagado: true,
        cotizacionUsada: true,
        fecha: true,
        items: {
          select: {
            productoId: true,
            cantidad: true,
            precioUnitarioUSD: true,
            tipoPrecio: true,
            presentacion: true,
            producto: {
              select: { id: true, precioCosto: true, monedaPrecio: true, contenidoMl: true },
            },
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

  const productoIds = Array.from(
    new Set(ventasRaw.flatMap((v) => v.items.map((i) => i.productoId).filter((id): id is number => id != null)))
  );

  const [historial, movimientosEgreso] = await Promise.all([
    productoIds.length
      ? prisma.historialPrecio.findMany({
          where: { productoId: { in: productoIds }, campo: "COSTO" },
          orderBy: { fecha: "asc" },
          select: { productoId: true, valorNuevo: true, fecha: true },
        })
      : Promise.resolve([]),
    prisma.movimientoCaja.findMany({
      where: { tipo: "EGRESO", concepto: "GASTO", fecha: { gte: desde, lt: hasta } },
      select: { monto: true, cuenta: { select: { tipo: true } } },
    }),
  ]);

  const historialPorProducto = new Map<number, { valorNuevo: number; fecha: Date }[]>();
  for (const h of historial) {
    const lista = historialPorProducto.get(h.productoId) ?? [];
    lista.push({ valorNuevo: h.valorNuevo, fecha: h.fecha });
    historialPorProducto.set(h.productoId, lista);
  }

  const ventas: VentaParaReporte[] = ventasRaw.map((v) => ({
    id: v.id,
    fecha: v.fecha,
    totalARS: v.totalARS,
    totalUSD: v.totalUSD,
    montoPagado: v.montoPagado,
    cotizacionUsada: v.cotizacionUsada,
    items: v.items.map((item) => {
      let costoUnitarioARS = 0;
      if (item.producto) {
        const costoBase = costoHistoricoDelProducto(
          historialPorProducto.get(item.producto.id),
          item.producto.precioCosto,
          v.fecha
        );
        const costoFrascoARS =
          item.producto.monedaPrecio === "USD" ? costoBase * v.cotizacionUsada : costoBase;
        const mlDecant =
          item.presentacion === "DECANT_5ML" || item.presentacion === "DECANT_10ML"
            ? ML_POR_PRESENTACION[item.presentacion]
            : null;
        costoUnitarioARS =
          mlDecant && item.producto.contenidoMl
            ? (costoFrascoARS / item.producto.contenidoMl) * mlDecant
            : costoFrascoARS;
      }
      return {
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitarioUSD: item.precioUnitarioUSD,
        tipoPrecio: item.tipoPrecio,
        presentacion: item.presentacion,
        nombreProducto: null,
        fotoUrl: null,
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

  let egresosGastosARS = 0;
  for (const m of movimientosEgreso) {
    const esUSD = m.cuenta.tipo === "EFECTIVO_USD" || m.cuenta.tipo === "BANCO_USD";
    egresosGastosARS += esUSD ? m.monto * cotizacionActual : m.monto;
  }

  const ventasEnriquecidas = enriquecerVentas(ventas);
  const { kpis } = calcularReporte(ventasEnriquecidas, egresosGastosARS);
  return { gananciaNetaARS: kpis.gananciaNetaARS, cantidadVentas: kpis.cantidadVentas };
}