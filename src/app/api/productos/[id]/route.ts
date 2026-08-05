import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productoId = params.id;
    const body = await request.json();

    const productoAnterior = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!productoAnterior) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const nuevoCosto = Number(body.precioCosto);
    const nuevoVenta = Number(body.precioVenta);
    const nuevoMayorista = body.precioMayorista ? Number(body.precioMayorista) : null;

    const productoActualizado = await prisma.producto.update({
      where: { id: productoId },
      data: {
        nombre: body.nombre.trim(),
        codigoBarras: body.codigoBarras || null,
        ubicacion: body.ubicacion || null,
        marcaId: body.marcaId || null,
        categoriaId: body.categoriaId || null,
        stockActual: Number(body.stockActual),
        stockMinimo: Number(body.stockMinimo || 0),
        destacado: Boolean(body.destacado),
        monedaPrecio: body.monedaPrecio,
        precioCosto: nuevoCosto,
        precioVenta: nuevoVenta,
        precioMayorista: nuevoMayorista,
        precioOferta: body.precioOferta ? Number(body.precioOferta) : null,
        esDecant: Boolean(body.esDecant),
      },
    });

    // Tipear el array utilizando el tipo generado por Prisma
    const registrosHistorial: Prisma.HistorialPrecioCreateManyInput[] = [];

    // Cambio en Precio Costo
    if (Number(productoAnterior.precioCosto) !== nuevoCosto) {
      registrosHistorial.push({
        productoId,
        campo: "COSTO" as any,
        valorAnterior: Number(productoAnterior.precioCosto),
        valorNuevo: nuevoCosto,
        origen: "MANUAL" as any,
      });
    }

    // Cambio en Precio Venta
    if (Number(productoAnterior.precioVenta) !== nuevoVenta) {
      registrosHistorial.push({
        productoId,
        campo: "VENTA" as any,
        valorAnterior: Number(productoAnterior.precioVenta),
        valorNuevo: nuevoVenta,
        origen: "MANUAL" as any,
      });
    }

    // Cambio en Precio Mayorista
    const mayoristaAnterior = productoAnterior.precioMayorista
      ? Number(productoAnterior.precioMayorista)
      : null;

    if (mayoristaAnterior !== nuevoMayorista && nuevoMayorista !== null) {
      registrosHistorial.push({
        productoId,
        campo: "MAYORISTA" as any,
        valorAnterior: mayoristaAnterior,
        valorNuevo: nuevoMayorista,
        origen: "MANUAL" as any,
      });
    }

    // Guardar en la base de datos si hubo cambios
    if (registrosHistorial.length > 0) {
      await prisma.historialPrecio.createMany({
        data: registrosHistorial,
      });
    }

    return NextResponse.json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}