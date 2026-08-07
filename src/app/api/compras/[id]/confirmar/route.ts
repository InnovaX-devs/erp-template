import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularCostoPromedioPonderado } from "@/lib/calculos/costoPromedioPonderado";
import type { Prisma } from "@prisma/client";

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
      include: { items: true },
    });

    if (!compra) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
    }

    if (compra.cancelada) {
      return NextResponse.json(
        { error: "No se puede confirmar una compra cancelada" },
        { status: 400 }
      );
    }

    if (compra.confirmada) {
      return NextResponse.json(
        { error: "La compra ya fue confirmada" },
        { status: 400 }
      );
    }

    if (compra.items.length === 0) {
      return NextResponse.json(
        { error: "La compra no tiene ítems" },
        { status: 400 }
      );
    }

    // Config: ¿costo promedio ponderado activo?
    const config = await prisma.configuracion.findUnique({
      where: { id: "singleton" },
      select: { costoPromedioPonderado: true },
    });
    const usarPonderado = config?.costoPromedioPonderado ?? true;

    const compraActualizada = await prisma.$transaction(async (tx) => {
      for (const item of compra.items) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          select: { id: true, stockActual: true, precioCosto: true },
        });

        if (!producto) {
          throw new Error(
            `El producto ${item.productoId} de la compra ya no existe`
          );
        }

        const nuevoStock = producto.stockActual + item.cantidad;

        const dataUpdate: Prisma.ProductoUpdateInput = {
          stockActual: nuevoStock,
        };

        if (usarPonderado) {
          const nuevoCosto = calcularCostoPromedioPonderado({
            stockActual: producto.stockActual,
            costoActual: producto.precioCosto,
            cantidadNueva: item.cantidad,
            costoNuevo: item.costoUnitario,
          });

          if (nuevoCosto !== producto.precioCosto) {
            dataUpdate.precioCosto = nuevoCosto;

            await tx.historialPrecio.create({
              data: {
                productoId: producto.id,
                campo: "COSTO",
                valorAnterior: producto.precioCosto,
                valorNuevo: nuevoCosto,
                origen: "COMPRA_CONFIRMADA",
                detalle: `Compra #${compra.id} confirmada (costo promedio ponderado)`,
              },
            });
          }
        }
        // Toggle desactivado: no se toca precioCosto (comportamiento
        // documentado en el issue #61 — no se pisa el costo directo).

        await tx.producto.update({
          where: { id: producto.id },
          data: dataUpdate,
        });
      }

      return tx.compra.update({
        where: { id: compra.id },
        data: { confirmada: true, recibida: true },
        include: { items: true },
      });
    });

    return NextResponse.json(compraActualizada);
  } catch (error: any) {
    console.error("Error al confirmar compra:", error);
    return NextResponse.json(
      { error: error.message || "Error al confirmar la compra" },
      { status: 500 }
    );
  }
}