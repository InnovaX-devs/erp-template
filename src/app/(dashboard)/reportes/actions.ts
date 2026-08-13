"use server";

import { prisma } from "@/lib/prisma";
import type {
  ResultadoReporte,
  ResultadoReportePorCuenta,
  DesgloseTipoPrecioItem,
  DesgloseMetodoCobroItem,
  ReportePorCuentaItem,
} from "@/types/reporte";

type RangoInput = {
  fechaInicio: string; // ISO
  fechaFin: string; // ISO
};

// Estados de venta que no representan ingreso real y se excluyen de todos los cálculos.
const ESTADOS_EXCLUIDOS = ["ANULADA", "CANCELADA"] as const;

function validarRango(input: RangoInput): { fechaInicio: Date; fechaFin: Date } | null {
  const fechaInicio = new Date(input.fechaInicio);
  const fechaFin = new Date(input.fechaFin);
  if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime()) || fechaInicio > fechaFin) {
    return null;
  }
  return { fechaInicio, fechaFin };
}

export async function obtenerReporte(input: RangoInput): Promise<ResultadoReporte> {
  try {
    const rango = validarRango(input);
    if (!rango) return { success: false, error: "Rango de fechas inválido." };
    const { fechaInicio, fechaFin } = rango;

    const [ventas, config] = await Promise.all([
      prisma.venta.findMany({
        where: {
          fecha: { gte: fechaInicio, lte: fechaFin },
          estadoPago: { notIn: [...ESTADOS_EXCLUIDOS] },
        },
        include: {
          items: {
            include: {
              producto: { select: { id: true, precioCosto: true, monedaPrecio: true } },
            },
          },
          pagos: {
            include: { cuenta: { select: { id: true, nombre: true, tipo: true } } },
          },
        },
      }),
      prisma.configuracion.findUnique({ where: { id: "singleton" } }),
    ]);

    const cotizacionActual = config?.cotizacionUSD ?? 1000;

    // --- Reconstruir costo histórico por producto (mejor esfuerzo) ---
    // ItemVenta no guarda un costo "congelado" al momento de la venta, así que
    // buscamos en HistorialPrecio (campo COSTO) la entrada más reciente anterior
    // o igual a la fecha de cada venta. Si no hay historial previo a esa fecha,
    // se usa el costo actual del producto como aproximación.
    const productoIds = Array.from(
      new Set(ventas.flatMap((v) => v.items.map((i) => i.productoId).filter((id): id is number => id != null)))
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

    function costoHistoricoDelProducto(productoId: number, costoActual: number, fechaVenta: Date): number {
      const lista = historialPorProducto.get(productoId);
      if (!lista || lista.length === 0) return costoActual;
      let costo = lista[0].valorNuevo;
      for (const entrada of lista) {
        if (entrada.fecha > fechaVenta) break;
        costo = entrada.valorNuevo;
      }
      return costo;
    }

    // --- Acumuladores ---
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
      { cuentaNombre: string; tipoCuenta: string; montoARS: number; cantidadPagos: number }
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

        // Ítems "Varios / Muestra" sin producto de catálogo no tienen costo
        // conocido: se computan con costo 0 (todo el monto queda como margen).
        if (item.producto) {
          const costoBase = costoHistoricoDelProducto(item.producto.id, item.producto.precioCosto, venta.fecha);
          const costoUnitarioARS =
            item.producto.monedaPrecio === "USD" ? costoBase * venta.cotizacionUsada : costoBase;
          costoVentaARS += costoUnitarioARS * item.cantidad;
        }
      }

      for (const pago of venta.pagos) {
        const actual = totalesPorCuenta.get(pago.cuentaId) ?? {
          cuentaNombre: pago.cuenta.nombre,
          tipoCuenta: pago.cuenta.tipo,
          montoARS: 0,
          cantidadPagos: 0,
        };
        actual.montoARS += pago.monto;
        actual.cantidadPagos += 1;
        totalesPorCuenta.set(pago.cuentaId, actual);
      }
    }

    const gananciaNetaARS = ingresosARS - costoVentaARS;
    const margenPorcentaje = ingresosARS > 0 ? (gananciaNetaARS / ingresosARS) * 100 : 0;

    // Egresos del período (gastos, pagos a proveedores, etc). Las cuentas en USD
    // se convierten con la cotización actual: el schema no guarda una cotización
    // histórica por MovimientoCaja.
    const movimientosEgreso = await prisma.movimientoCaja.findMany({
      where: { tipo: "EGRESO", fecha: { gte: fechaInicio, lte: fechaFin } },
      include: { cuenta: { select: { tipo: true } } },
    });
    const egresosARS = movimientosEgreso.reduce((acc, m) => {
      const esUSD = m.cuenta.tipo === "EFECTIVO_USD" || m.cuenta.tipo === "BANCO_USD";
      return acc + (esUSD ? m.monto * cotizacionActual : m.monto);
    }, 0);

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
        tipoCuenta: c.tipoCuenta as DesgloseMetodoCobroItem["tipoCuenta"],
        montoARS: c.montoARS,
        cantidadPagos: c.cantidadPagos,
        porcentaje: totalCobros > 0 ? (c.montoARS / totalCobros) * 100 : 0,
      }))
      .sort((a, b) => b.montoARS - a.montoARS);

    return {
      success: true,
      data: {
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
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
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Ocurrió un error al generar el reporte." };
  }
}

export async function obtenerReportePorCuenta(input: RangoInput): Promise<ResultadoReportePorCuenta> {
  try {
    const rango = validarRango(input);
    if (!rango) return { success: false, error: "Rango de fechas inválido." };
    const { fechaInicio, fechaFin } = rango;

    const [cuentas, movimientos] = await Promise.all([
      prisma.cuenta.findMany({
        where: { activa: true },
        select: { id: true, nombre: true, tipo: true, saldoActual: true },
        orderBy: { nombre: "asc" },
      }),
      prisma.movimientoCaja.findMany({
        where: { fecha: { gte: fechaInicio, lte: fechaFin } },
        select: { cuentaId: true, tipo: true, monto: true },
      }),
    ]);

    const agregados = new Map<number, { ingresos: number; egresos: number; cantidadMovimientos: number }>();
    for (const m of movimientos) {
      const actual = agregados.get(m.cuentaId) ?? { ingresos: 0, egresos: 0, cantidadMovimientos: 0 };
      if (m.tipo === "INGRESO") actual.ingresos += m.monto;
      else actual.egresos += m.monto;
      actual.cantidadMovimientos += 1;
      agregados.set(m.cuentaId, actual);
    }

    const cuentasResultado: ReportePorCuentaItem[] = cuentas.map((c) => {
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

    return {
      success: true,
      data: {
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        cuentas: cuentasResultado,
      },
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Ocurrió un error al generar el reporte por cuenta." };
  }
}