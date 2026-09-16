import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerEmpresaIdActual } from "@/lib/empresa";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const empresaId = await obtenerEmpresaIdActual();
    const { id } = await params;
    const productoId = Number(id);

    if (isNaN(productoId)) {
      return NextResponse.json(
        { error: "El ID del producto debe ser un número válido" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (typeof body.activo !== "boolean") {
      return NextResponse.json(
        { error: "El campo 'activo' debe ser true o false" },
        { status: 400 }
      );
    }

    const existe = await prisma.producto.findFirst({ where: { id: productoId, empresaId } });
    if (!existe) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const producto = await prisma.producto.update({
      where: { id: productoId },
      data: { activo: body.activo },
      select: { id: true, nombre: true, activo: true },
    });

    return NextResponse.json(producto);
  } catch (error: any) {
    console.error("Error al cambiar estado del producto:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar el estado del producto" },
      { status: 500 }
    );
  }
}