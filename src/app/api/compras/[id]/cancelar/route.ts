import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const compraId = Number(id);

    if (isNaN(compraId)) {
      return NextResponse.json(
        { error: "El ID de la compra debe ser un número válido" },
        { status: 400 }
      );
    }

    const compra = await prisma.compra.findUnique({
      where: { id: compraId },
    });

    if (!compra) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
    }

    if (compra.cancelada) {
      return NextResponse.json(
        { error: "La compra ya está cancelada" },
        { status: 400 }
      );
    }

    if (compra.confirmada) {
      return NextResponse.json(
        {
          error:
            "No se puede cancelar una compra ya confirmada: ya impactó en stock y costo del producto.",
        },
        { status: 400 }
      );
    }

    const compraCancelada = await prisma.compra.update({
      where: { id: compraId },
      data: { cancelada: true },
    });

    return NextResponse.json(compraCancelada);
  } catch (error: any) {
    console.error("Error al cancelar compra:", error);
    return NextResponse.json(
      { error: error.message || "Error al cancelar la compra" },
      { status: 500 }
    );
  }
}