import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productoId = Number(id);

    if (isNaN(productoId)) {
      return NextResponse.json(
        { error: "El ID del producto debe ser un número válido" },
        { status: 400 }
      );
    }

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

    // Conversión segura de precios
    const nuevoCosto = Number(body.precioCosto);
    const nuevoVenta = Number(body.precioVenta);

    if (isNaN(nuevoCosto) || isNaN(nuevoVenta)) {
      return NextResponse.json(
        { error: "Los precios deben ser números válidos" },
        { status: 400 }
      );
    }

    const nuevoMayorista =
      body.precioMayorista !== undefined &&
      body.precioMayorista !== "" &&
      body.precioMayorista !== null &&
      !isNaN(Number(body.precioMayorista))
        ? Number(body.precioMayorista)
        : null;

    const nuevoOferta =
      body.precioOferta !== undefined &&
      body.precioOferta !== "" &&
      body.precioOferta !== null &&
      !isNaN(Number(body.precioOferta))
        ? Number(body.precioOferta)
        : null;

    // Ubicación en depósito
    const ubicacionDeposito =
      body.ubicacion && String(body.ubicacion).trim() !== ""
        ? String(body.ubicacion).trim()
        : null;

    // Código de barras
    const codigoBarras =
      body.codigoBarras && String(body.codigoBarras).trim() !== ""
        ? String(body.codigoBarras).trim()
        : null;

    // Marca y Categoría (Int)
    const marcaId =
      body.marcaId && !isNaN(Number(body.marcaId))
        ? Number(body.marcaId)
        : null;

    const categoriaId =
      body.categoriaId && !isNaN(Number(body.categoriaId))
        ? Number(body.categoriaId)
        : null;

    const stockActual = !isNaN(Number(body.stockActual))
      ? Number(body.stockActual)
      : 0;

    const stockMinimo = !isNaN(Number(body.stockMinimo))
      ? Number(body.stockMinimo)
      : 0;

    const productoActualizado = await prisma.producto.update({
      where: { id: productoId },
      data: {
        nombre: String(body.nombre || "").trim(),
        codigoBarras,
        ubicacionDeposito,
        marcaId,
        categoriaId,
        stockActual,
        stockMinimo,
        destacado: Boolean(body.destacado),
        monedaPrecio: body.monedaPrecio || "USD",
        precioCosto: nuevoCosto,
        precioVenta: nuevoVenta,
        precioMayorista: nuevoMayorista,
        precioOferta: nuevoOferta,
        seVendePorDecant: Boolean(body.esDecant),
        fotoUrl: body.fotoUrl !== undefined ? body.fotoUrl : undefined,
      },
    });

    // Auditoría e historial de precios
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

    // Registrar cambios en el historial de precios si los hubo
    if (registrosHistorial.length > 0) {
      await prisma.historialPrecio.createMany({
        data: registrosHistorial,
      });
    }

    return NextResponse.json(productoActualizado);
  } catch (error: any) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al actualizar el producto" },
      { status: 500 }
    );
  }
}