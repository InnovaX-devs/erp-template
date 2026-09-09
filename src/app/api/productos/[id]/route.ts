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

    // Overrides manuales de precio de decant
    const nuevoOverride5ml =
      body.overrideDecant5ml !== undefined &&
      body.overrideDecant5ml !== "" &&
      body.overrideDecant5ml !== null &&
      !isNaN(Number(body.overrideDecant5ml))
        ? Number(body.overrideDecant5ml)
        : null;

    const nuevoOverride10ml =
      body.overrideDecant10ml !== undefined &&
      body.overrideDecant10ml !== "" &&
      body.overrideDecant10ml !== null &&
      !isNaN(Number(body.overrideDecant10ml))
        ? Number(body.overrideDecant10ml)
        : null;

    // Ubicación en depósito
    const ubicacionDeposito =
      body.ubicacion && String(body.ubicacion).trim() !== ""
        ? String(body.ubicacion).trim()
        : null;

    // Contenido en ml de la botella (usado en el cálculo de precio de decant)
    const contenidoMl =
      body.contenidoMl !== undefined &&
      body.contenidoMl !== "" &&
      body.contenidoMl !== null &&
      !isNaN(Number(body.contenidoMl))
        ? Number(body.contenidoMl)
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

    // Auditoría e historial de precios.
    // Se arma ANTES del update para comparar contra los valores previos.
    const registrosHistorial: Prisma.HistorialPrecioCreateManyInput[] = [];

    // Cambio en Precio Costo
    if (Number(productoAnterior.precioCosto) !== nuevoCosto) {
      registrosHistorial.push({
        productoId,
        campo: "COSTO",
        valorAnterior: Number(productoAnterior.precioCosto),
        valorNuevo: nuevoCosto,
        origen: "MANUAL",
      });
    }

    // Cambio en Precio Venta Minorista
    if (Number(productoAnterior.precioVenta) !== nuevoVenta) {
      registrosHistorial.push({
        productoId,
        campo: "MINORISTA",
        valorAnterior: Number(productoAnterior.precioVenta),
        valorNuevo: nuevoVenta,
        origen: "MANUAL",
      });
    }

    // Cambio en Precio Mayorista
    const mayoristaAnterior = productoAnterior.precioMayorista
      ? Number(productoAnterior.precioMayorista)
      : null;

    if (mayoristaAnterior !== nuevoMayorista && nuevoMayorista !== null) {
      registrosHistorial.push({
        productoId,
        campo: "MAYORISTA",
        valorAnterior: mayoristaAnterior,
        valorNuevo: nuevoMayorista,
        origen: "MANUAL",
      });
    }

    // Cambio en override de decant 5ml
    const override5mlAnterior = productoAnterior.overrideDecant5ml
      ? Number(productoAnterior.overrideDecant5ml)
      : null;

    if (override5mlAnterior !== nuevoOverride5ml && nuevoOverride5ml !== null) {
      registrosHistorial.push({
        productoId,
        campo: "OVERRIDE_5ML",
        valorAnterior: override5mlAnterior,
        valorNuevo: nuevoOverride5ml,
        origen: "MANUAL",
      });
    }

    // Cambio en override de decant 10ml
    const override10mlAnterior = productoAnterior.overrideDecant10ml
      ? Number(productoAnterior.overrideDecant10ml)
      : null;

    if (override10mlAnterior !== nuevoOverride10ml && nuevoOverride10ml !== null) {
      registrosHistorial.push({
        productoId,
        campo: "OVERRIDE_10ML",
        valorAnterior: override10mlAnterior,
        valorNuevo: nuevoOverride10ml,
        origen: "MANUAL",
      });
    }

    // Update del producto e inserción del historial en una misma transacción.
    const [productoActualizado] = await prisma.$transaction([
      prisma.producto.update({
        where: { id: productoId },
        data: {
          nombre: String(body.nombre || "").trim(),
          codigoBarras,
          ubicacionDeposito,
          contenidoMl,
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
          overrideDecant5ml: nuevoOverride5ml,
          overrideDecant10ml: nuevoOverride10ml,
          seVendePorDecant: Boolean(body.esDecant),
          fotoUrl: body.fotoUrl !== undefined ? body.fotoUrl : undefined,
        },
      }),
      ...(registrosHistorial.length > 0
        ? [prisma.historialPrecio.createMany({ data: registrosHistorial })]
        : []),
    ]);

    return NextResponse.json(productoActualizado);
  } catch (error: any) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al actualizar el producto" },
      { status: 500 }
    );
  }
}