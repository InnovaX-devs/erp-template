import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gastoId = Number(id);
    if (!Number.isInteger(gastoId)) {
      return NextResponse.json({ error: "ID de gasto inválido" }, { status: 400 });
    }

    const body = await request.json();
    const cuentaId = Number(body.cuentaId);
    if (!cuentaId) {
      return NextResponse.json({ error: "Elegí la cuenta de origen del pago" }, { status: 400 });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const gasto = await tx.gasto.findUnique({ where: { id: gastoId } });
      if (!gasto) throw new Error("GASTO_NO_ENCONTRADO");
      if (gasto.estadoPago === "PAGADO") throw new Error("YA_PAGADO");

      const cuenta = await tx.cuenta.findUnique({ where: { id: cuentaId } });
      if (!cuenta) throw new Error("CUENTA_NO_ENCONTRADA");

      const esCuentaUSD = cuenta.tipo === "EFECTIVO_USD" || cuenta.tipo === "BANCO_USD";

      let montoADescontar = gasto.monto; // el gasto se guarda en ARS
      if (esCuentaUSD) {
        const config = await tx.configuracion.findUnique({ where: { id: "singleton" } });
        const cotizacion = config?.cotizacionUSD ?? 0;
        if (!cotizacion) throw new Error("SIN_COTIZACION");
        montoADescontar = gasto.monto / cotizacion; // convierte ARS -> USD
      }

      const saldoResultante = cuenta.saldoActual - montoADescontar;

      await tx.movimientoCaja.create({
        data: {
          cuentaId,
          tipo: "EGRESO",
          concepto: "GASTO",
          monto: montoADescontar,
          saldoResultante,
          gastoId: gasto.id,
        },
      });

      await tx.cuenta.update({
        where: { id: cuentaId },
        data: { saldoActual: saldoResultante },
      });

      return tx.gasto.update({
        where: { id: gastoId },
        data: { estadoPago: "PAGADO" },
      });
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    if (error?.message === "GASTO_NO_ENCONTRADO") {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }
    if (error?.message === "YA_PAGADO") {
      return NextResponse.json({ error: "El gasto ya está pagado" }, { status: 409 });
    }
    if (error?.message === "CUENTA_NO_ENCONTRADA") {
      return NextResponse.json({ error: "La cuenta seleccionada no existe" }, { status: 404 });
    }
    if (error?.message === "SIN_COTIZACION") {
      return NextResponse.json({ error: "No hay una cotización de USD configurada" }, { status: 400 });
    }
    console.error("Error al pagar gasto:", error);
    return NextResponse.json({ error: "Error al marcar el gasto como pagado" }, { status: 500 });
  }
}