import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const desde = sp.get("desde");
  const hasta = sp.get("hasta");
  const tipo = sp.get("tipo");
  const cuentaId = sp.get("cuentaId");
  const concepto = sp.get("concepto");

  const where: Prisma.MovimientoCajaWhereInput = {
    ...(desde || hasta
      ? {
          fecha: {
            ...(desde ? { gte: new Date(desde) } : {}),
            ...(hasta ? { lte: new Date(`${hasta}T23:59:59`) } : {}),
          },
        }
      : {}),
    ...(tipo ? { tipo: tipo as Prisma.EnumTipoMovimientoCajaFilter["equals"] } : {}),
    ...(cuentaId ? { cuentaId: Number(cuentaId) } : {}),
    ...(concepto ? { concepto: concepto as Prisma.EnumConceptoMovimientoCajaFilter["equals"] } : {}),
  };

  const items = await prisma.movimientoCaja.findMany({
    where,
    orderBy: { fecha: "desc" },
    take: 200,
    include: {
      cuenta: { select: { id: true, nombre: true, tipo: true } },
    },
  });

  // Resumen: se calcula sobre TODO el período filtrado (sin el take:200),
  // para que las tarjetas no queden truncadas si hay más de 200 movimientos.
  const todosEnPeriodo = await prisma.movimientoCaja.findMany({
    where,
    select: { tipo: true, monto: true, cuenta: { select: { tipo: true } } },
  });

  let ingresos = 0;
  let egresos = 0;
  let totalEfectivo = 0;
  let totalTransferencia = 0;

  for (const m of todosEnPeriodo) {
    if (m.tipo === "INGRESO") ingresos += m.monto;
    else egresos += m.monto;

    const esEfectivo = m.cuenta.tipo.startsWith("EFECTIVO");
    const signo = m.tipo === "INGRESO" ? 1 : -1;
    if (esEfectivo) totalEfectivo += m.monto * signo;
    else totalTransferencia += m.monto * signo;
  }

  const saldoTotal = await prisma.cuenta.aggregate({
    where: { activa: true },
    _sum: { saldoActual: true },
  });

  return NextResponse.json({
    items,
    resumen: {
      saldoTotal: saldoTotal._sum.saldoActual ?? 0,
      totalEfectivo,
      totalTransferencia,
      ingresosPeriodo: ingresos,
      egresosPeriodo: egresos,
      netoPeriodo: ingresos - egresos,
    },
  });
}