import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toArs } from "@/lib/currency";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
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
    // Base de las tarjetas resumen: SIEMPRE todo el catálogo activo,
    // sin aplicar el filtro de búsqueda.
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validaciones básicas de campos obligatorios en backend
    if (
      !body.nombre?.trim() ||
      body.stockActual === undefined ||
      body.precioCosto === undefined ||
      body.precioVenta === undefined
    ) {
      return NextResponse.json(
        { error: "Nombre, stock actual, precio costo y precio venta son obligatorios" },
        { status: 400 }
      );
    }

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: body.nombre.trim(),
        codigoBarras: body.codigoBarras || null,
        ubicacion: body.ubicacion || null,
        marcaId: body.marcaId || null,
        categoriaId: body.categoriaId || null,
        stockActual: Number(body.stockActual),
        stockMinimo: Number(body.stockMinimo || 0),
        destacado: Boolean(body.destacado),
        monedaPrecio: body.monedaPrecio || "USD",
        precioCosto: Number(body.precioCosto),
        precioVenta: Number(body.precioVenta),
        precioMayorista: body.precioMayorista ? Number(body.precioMayorista) : null,
        precioOferta: body.precioOferta ? Number(body.precioOferta) : null,
        esDecant: Boolean(body.esDecant),
        activo: true,
      },
    });

    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}