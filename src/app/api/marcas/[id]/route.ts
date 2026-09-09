import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Editar nombre o cambiar estado (activa: true/false)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const marcaId = Number(id);

    if (isNaN(marcaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const dataToUpdate: any = {};

    if (body.nombre !== undefined) {
      dataToUpdate.nombre = String(body.nombre).trim();
    }
    if (body.activa !== undefined) {
      dataToUpdate.activa = Boolean(body.activa);
    }

    const marcaActualizada = await prisma.marca.update({
      where: { id: marcaId },
      data: dataToUpdate,
    });

    return NextResponse.json(marcaActualizada);
  } catch (error: any) {
    console.error("Error al actualizar marca:", error);
    return NextResponse.json(
      { error: "Error al actualizar la marca" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar marca solo si NO tiene productos asociados
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const marcaId = Number(id);

    if (isNaN(marcaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar si tiene productos asociados
    const productosCount = await prisma.producto.count({
      where: { marcaId },
    });

    if (productosCount > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la marca porque tiene ${productosCount} producto(s) asociado(s). Desactívala en su lugar.`,
        },
        { status: 400 }
      );
    }

    await prisma.marca.delete({
      where: { id: marcaId },
    });

    return NextResponse.json({ message: "Marca eliminada correctamente" });
  } catch (error: any) {
    console.error("Error al eliminar marca:", error);
    return NextResponse.json(
      { error: "Error al eliminar la marca" },
      { status: 500 }
    );
  }
}