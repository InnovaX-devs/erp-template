import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerReporte } from "../../(dashboard)/reportes/queries";
import { rangoParaTab } from "@/lib/reportes";

export const dynamic = "force-dynamic";

function descripcionMovimiento(m: {
  concepto: string;
  ventaId: number | null;
  gasto: { concepto: string } | null;
}) {
  switch (m.concepto) {
    case "VENTA_COBRADA":
      return `Venta #${m.ventaId}`;
    case "PAGO_DEUDA_CLIENTE":
      return "Pago de deuda";
    case "PAGO_A_PROVEEDOR":
      return "Pago a proveedor";
    case "GASTO":
      return m.gasto?.concepto ?? "Gasto";
    default:
      return "Movimiento";
  }
}

export async function GET() {
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  const finHoy = new Date(inicioHoy);
  finHoy.setDate(finHoy.getDate() + 1);

  const configuracion = await prisma.configuracion.findUnique({
    where: { id: "singleton" },
    select: { cotizacionUSD: true },
  });
  const cotizacionActual = configuracion?.cotizacionUSD ?? 1000;

  // --- Cuentas / saldo total ---
  const cuentas = await prisma.cuenta.findMany({
    where: { activa: true },
    orderBy: [{ favorita: "desc" }, { saldoActual: "desc" }],
  });

  let saldoTotal = 0;
  for (const c of cuentas) {
    saldoTotal += c.tipo.endsWith("USD") ? c.saldoActual * cotizacionActual : c.saldoActual;
  }

  // --- Ganancia de hoy: MISMA lógica que Reportes (prorrateada por lo
  // efectivamente cobrado, neta de gastos GASTO del día). No se recalcula acá
  // aparte para evitar que dashboard y reportes puedan desincronizarse. ---
  const reporteHoy = await obtenerReporte(rangoParaTab("diario"));
  const gananciaHoyARS = reporteHoy.kpis.gananciaNetaARS;
  const cantidadVentasHoy = reporteHoy.kpis.cantidadVentas;

  // --- Movimientos de caja de hoy (ingresos/egresos reales) ---
  const movimientosHoy = await prisma.movimientoCaja.findMany({
    where: { fecha: { gte: inicioHoy, lt: finHoy } },
    include: {
      gasto: { select: { concepto: true } },
      cuenta: { select: { tipo: true } },
    },
    orderBy: { fecha: "desc" },
  });

  const ingresosHoyARS = movimientosHoy
    .filter((m) => m.tipo === "INGRESO")
    .reduce((acc, m) => acc + (m.cuenta.tipo.endsWith("USD") ? m.monto * cotizacionActual : m.monto), 0);

  const egresosHoyARS = movimientosHoy
    .filter((m) => m.tipo === "EGRESO")
    .reduce((acc, m) => acc + (m.cuenta.tipo.endsWith("USD") ? m.monto * cotizacionActual : m.monto), 0);

  const movimientos = movimientosHoy.slice(0, 10).map((m) => ({
    id: m.id,
    hora: m.fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    descripcion: descripcionMovimiento(m),
    monto: m.monto,
    moneda: m.cuenta.tipo.endsWith("USD") ? "USD" as const : "ARS" as const,
    tipo: m.tipo === "INGRESO" ? ("ingreso" as const) : ("egreso" as const),
  }));

  // --- Pedidos por armar / armados (global, no solo hoy) ---
  const [porArmar, armados] = await Promise.all([
    prisma.venta.count({
      where: { armado: false, estadoPago: { notIn: ["ANULADA", "CANCELADA"] } },
    }),
    prisma.venta.count({
      where: { armado: true, retirado: false, estadoPago: { notIn: ["ANULADA", "CANCELADA"] } },
    }),
  ]);

  return NextResponse.json({
    cuentas: {
      saldoTotal,
      principales: cuentas.slice(0, 5).map((c) => ({
        id: c.id,
        nombre: c.nombre,
        tipo: c.tipo,
        saldoActual: c.saldoActual,
        color: c.color,
      })),
      totalCantidad: cuentas.length,
    },
    hoy: {
      gananciaARS: gananciaHoyARS,
      cantidadVentas: cantidadVentasHoy,
      ingresosARS: ingresosHoyARS,
      egresosARS: egresosHoyARS,
    },
    pedidos: { porArmar, armados },
    movimientos,
  });
}