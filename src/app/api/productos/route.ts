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