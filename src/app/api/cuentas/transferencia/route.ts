import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerEmpresaIdActual } from "@/lib/empresa";

export async function POST(request: NextRequest) {
  try {
    const empresaId = await obtenerEmpresaIdActual();
    const body = await request.json();
    const cuentaOrigenId = Number(body.cuentaOrigenId);
    const cuentaDestinoId = Number(body.cuentaDestinoId);
    const monto = Number(body.monto);
    const concepto: string | undefined = body.concepto?.trim() || undefined;

    if (Number.isNaN(cuentaOrigenId) || Number.isNaN(cuentaDestinoId)) {
      return NextResponse.json({ error: "Cuentas inválidas" }, { status: 400 });
    }
    if (cuentaOrigenId === cuentaDestinoId) {
      return NextResponse.json(
        { error: "La cuenta de origen y destino no pueden ser la misma" },
        { status: 400 }
      );
    }
    if (!monto || monto <= 0) {
      return NextResponse.json({ error: "El monto debe ser mayor a 0" }, { status: 400 });
    }

    const [origen, destino] = await Promise.all([
      prisma.cuenta.findFirst({ where: { id: cuentaOrigenId, empresaId } }),
      prisma.cuenta.findFirst({ where: { id: cuentaDestinoId, empresaId } }),
    ]);

    if (!origen || !destino) {
      return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
    }

    const monedaOrigen = origen.tipo.endsWith("USD") ? "USD" : "ARS";
    const monedaDestino = destino.tipo.endsWith("USD") ? "USD" : "ARS";
    if (monedaOrigen !== monedaDestino) {
      return NextResponse.json(
        { error: "Solo se puede transferir entre cuentas de la misma moneda" },
        { status: 400 }
      );
    }

    const saldoOrigenResultante = origen.saldoActual - monto;
    if (saldoOrigenResultante < 0) {
      return NextResponse.json(
        { error: "Saldo insuficiente en la cuenta de origen" },
        { status: 400 }
      );
    }
    const saldoDestinoResultante = destino.saldoActual + monto;

    const resultado = await prisma.$transaction([
      prisma.cuenta.update({
        where: { id: cuentaOrigenId },
        data: { saldoActual: saldoOrigenResultante },
      }),
      prisma.cuenta.update({
        where: { id: cuentaDestinoId },
        data: { saldoActual: saldoDestinoResultante },
      }),
      prisma.movimientoCaja.create({
        data: {
          empresaId,
          cuentaId: cuentaOrigenId,
          tipo: "EGRESO",
          concepto: "TRANSFERENCIA",
          monto,
          saldoResultante: saldoOrigenResultante,
          detalle: concepto ? `A ${destino.nombre}: ${concepto}` : `Transferencia a ${destino.nombre}`,
        },
      }),
      prisma.movimientoCaja.create({
        data: {
          empresaId,
          cuentaId: cuentaDestinoId,
          tipo: "INGRESO",
          concepto: "TRANSFERENCIA",
          monto,
          saldoResultante: saldoDestinoResultante,
          detalle: concepto ? `De ${origen.nombre}: ${concepto}` : `Transferencia de ${origen.nombre}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, origen: resultado[0], destino: resultado[1] });
  } catch (error) {
    console.error("Error al transferir:", error);
    return NextResponse.json({ error: "Error al realizar la transferencia" }, { status: 500 });
  }
}