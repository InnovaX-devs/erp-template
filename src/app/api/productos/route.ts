import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toArs } from "@/lib/currency";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q")?.trim() ?? "";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 50)));

    const where: Prisma.ProductoWhereInput = {
      activo: true,
      ...(q ? { nombre: { contains: q, mode: "insensitive" } } : {}),
    };

    const [items, total, aggregateBase] = await Promise.all([
      prisma.producto.findMany({
        where,
        orderBy: { nombre: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          nombre: true,
          stockActual: true,
          monedaPrecio: true,
          precioCosto: true,
          precioVenta: true,
          precioMayorista: true,
          marca: { select: { nombre: true } },
        },
      }),
      prisma.producto.count({ where }),
      prisma.producto.findMany({
        where: { activo: true },
        select: {
          stockActual: true,
          precioCosto: true,
          precioVenta: true,
          monedaPrecio: true,
        },
      }),
    ]);

    let stockCostoArs = 0;
    let stockVentaArs = 0;

    for (const p of aggregateBase) {
      stockCostoArs += p.stockActual * toArs(p.precioCosto, p.monedaPrecio);
      stockVentaArs += p.stockActual * toArs(p.precioVenta, p.monedaPrecio);
    }

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      summary: {
        stockCostoArs,
        stockVentaArs,
        gananciaPotencialArs: stockVentaArs - stockCostoArs,
      },
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar únicamente campos obligatorios
    if (
      !body.nombre ||
      typeof body.nombre !== "string" ||
      !body.nombre.trim() ||
      body.stockActual === undefined ||
      body.stockActual === "" ||
      body.precioCosto === undefined ||
      body.precioCosto === "" ||
      body.precioVenta === undefined ||
      body.precioVenta === ""
    ) {
      return NextResponse.json(
        { error: "Nombre, stock actual, precio de costo y precio de venta son obligatorios" },
        { status: 400 }
      );
    }

    // Convertir y sanear valores vacíos
    const codigoBarras = body.codigoBarras && String(body.codigoBarras).trim() !== "" 
      ? String(body.codigoBarras).trim() 
      : null;

    const ubicacion = body.ubicacion && String(body.ubicacion).trim() !== "" 
      ? String(body.ubicacion).trim() 
      : null;

    const marcaId = body.marcaId && String(body.marcaId).trim() !== "" 
      ? String(body.marcaId).trim() 
      : null;

    const categoriaId = body.categoriaId && String(body.categoriaId).trim() !== "" 
      ? String(body.categoriaId).trim() 
      : null;

    const stockActual = Number(body.stockActual);
    const stockMinimo = body.stockMinimo !== undefined && body.stockMinimo !== "" ? Number(body.stockMinimo) : 0;
    const precioCosto = Number(body.precioCosto);
    const precioVenta = Number(body.precioVenta);

    const precioMayorista = body.precioMayorista !== undefined && body.precioMayorista !== "" && body.precioMayorista !== null
      ? Number(body.precioMayorista) 
      : null;

    const precioOferta = body.precioOferta !== undefined && body.precioOferta !== "" && body.precioOferta !== null
      ? Number(body.precioOferta) 
      : null;

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: body.nombre.trim(),
        codigoBarras,
        ubicacion,
        marcaId,
        categoriaId,
        stockActual,
        stockMinimo,
        destacado: Boolean(body.destacado),
        monedaPrecio: body.monedaPrecio === "ARS" ? "ARS" : "USD",
        precioCosto,
        precioVenta,
        precioMayorista,
        precioOferta,
        esDecant: Boolean(body.esDecant),
        activo: true,
      },
    });

    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear producto:", error);

    // Captura de duplicados en Prisma (por ejemplo, código de barras repetido)
    if (error.code === "P2002") {
      const targetField = error.meta?.target?.[0] || "campo";
      return NextResponse.json(
        { error: `El valor ingresado para ${targetField} ya existe en el sistema` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al crear el producto" },
      { status: 500 }
    );
  }
}