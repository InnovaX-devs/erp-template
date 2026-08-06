import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    OR: [
      { nombre: { contains: q, mode: "insensitive" } },
      { codigoBarras: { contains: q, mode: "insensitive" } },
    ],
  };

  const items = await prisma.producto.findMany({
    where,
    orderBy: { nombre: "asc" },
    take: 10,
    select: {
      id: true,
      nombre: true,
      codigoBarras: true,
      stockActual: true,
      monedaPrecio: true,
      precioCosto: true,
      precioVenta: true,
      precioMayorista: true,
      seVendePorDecant: true,
      marca: { select: { nombre: true } },
    },
  });

  return NextResponse.json({ items });
}