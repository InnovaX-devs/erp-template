import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cuentaId = params.id;
    const body = await request.json();

    const cuentaExistente = await prisma.cuenta.findUnique({ where: { id: cuentaId } });
    if (!cuentaExistente) {
      return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
    }

    if (!body.nombre?.trim() || !body.tipo) {
      return NextResponse.json(
        { error: "El nombre y el tipo de cuenta son obligatorios" },
        { status: 400 }
      );
    }

    const esBanco = body.tipo === "BANCO_ARS" || body.tipo === "BANCO_USD";

    const cuentaActualizada = await prisma.cuenta.update({
      where: { id: cuentaId },
      data: {
        nombre: body.nombre.trim(),
        tipo: body.tipo,
        titular: esBanco ? body.titular?.trim() || null : null,
        banco: esBanco ? body.banco?.trim() || null : null,
        alias: esBanco ? body.alias?.trim() || null : null,
        cbu: esBanco ? body.cbu?.trim() || null : null,
        color: body.color || null,
        favorita: Boolean(body.favorita),
        limiteMensualIngresos: body.limiteMensualIngresos
          ? Number(body.limiteMensualIngresos)
          : null,
        // saldoInicial y saldoActual NO se editan acá: el saldo se mueve
        // únicamente a través de MovimientoCaja para no romper la trazabilidad.
      },
    });

    return NextResponse.json(cuentaActualizada);
  } catch (error) {
    console.error("Error al actualizar cuenta:", error);
    return NextResponse.json({ error: "Error al actualizar la cuenta" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cuentaId = params.id;
    const body = await request.json();

    if (typeof body.activa !== "boolean") {
      return NextResponse.json({ error: "Falta el campo 'activa'" }, { status: 400 });
    }

    const cuenta = await prisma.cuenta.update({
      where: { id: cuentaId },
      data: { activa: body.activa },
    });

    return NextResponse.json(cuenta);
  } catch (error) {
    console.error("Error al cambiar estado de cuenta:", error);
    return NextResponse.json({ error: "Error al cambiar el estado de la cuenta" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cuentaId = params.id;

    const [movimientos, pagos] = await Promise.all([
      prisma.movimientoCaja.count({ where: { cuentaId } }),
      prisma.pagoVenta.count({ where: { cuentaId } }),
    ]);

    if (movimientos > 0 || pagos > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar: la cuenta tiene movimientos o pagos asociados. Desactivala en su lugar.",
        },
        { status: 409 }
      );
    }

    await prisma.cuenta.delete({ where: { id: cuentaId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    return NextResponse.json({ error: "Error al eliminar la cuenta" }, { status: 500 });
  }
}