import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularGananciaVentas } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

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

  // --- Ventas de hoy (excluye anuladas/canceladas) ---
  const ventasHoy = await prisma.venta.findMany({
    where: {
      fecha: { gte: inicioHoy, lt: finHoy },
      estadoPago: { notIn: ["ANULADA", "CANCELADA"] },
    },
    include: {
      items: {
        include: { producto: { select: { precioCosto: true, monedaPrecio: true } } },
      },
    },
  });

  const gananciaHoyARS = calcularGananciaVentas(ventasHoy);

  // --- Pedidos por armar / armados (global, no solo hoy) ---
  const [porArmar, armados] = await Promise.all([
    prisma.venta.count({
      where: { armado: false, estadoPago: { notIn: ["ANULADA", "CANCELADA"] } },
    }),
    prisma.venta.count({
      where: { armado: true, estadoPago: { notIn: ["ANULADA", "CANCELADA"] } },
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
        favorita: c.favorita,
      })),
      totalCantidad: cuentas.length,
    },
    hoy: {
      gananciaARS: gananciaHoyARS,
      cantidadVentas: ventasHoy.length,
    },
    pedidos: { porArmar, armados },
  });
}