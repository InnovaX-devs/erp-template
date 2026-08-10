import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const WHERE_COMPRA_REAL = {
  confirmada: true,
  cancelada: false,
} satisfies Prisma.CompraWhereInput;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const estado = searchParams.get("estado") ?? "todos";

  const proveedores = await prisma.proveedor.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      personaContacto: true,
      telefono: true,
      email: true,
      deudaInicial: true,
      notas: true,
      createdAt: true,
      compras: {
        where: WHERE_COMPRA_REAL,
        // totalARS siempre está seteado acá porque WHERE_COMPRA_REAL
        // filtra confirmada: true, y totalARS/cotizacionUsada se completan
        // justo al confirmar (ver /api/compras/[id]/confirmar).
        select: { totalUSD: true, totalARS: true, pagada: true },
      },
    },
  });

  const proveedoresConCalculos = proveedores.map((p) => {
    const cantidadCompras = p.compras.length;
    const totalComprado = p.compras.reduce((acc, c) => acc + (c.totalARS ?? 0), 0);
    const totalCompradoUSD = p.compras.reduce((acc, c) => acc + c.totalUSD, 0);
    const deudaCompras = p.compras
      .filter((c) => !c.pagada)
      .reduce((acc, c) => acc + (c.totalARS ?? 0), 0);
    const deuda = p.deudaInicial + deudaCompras;

    return {
      id: p.id,
      nombre: p.nombre,
      personaContacto: p.personaContacto,
      telefono: p.telefono,
      email: p.email,
      deudaInicial: p.deudaInicial,
      notas: p.notas,
      cantidadCompras,
      totalComprado,
      totalCompradoUSD,
      deuda,
      alDia: deuda <= 0,
    };
  });

  const resumen = {
    totalProveedores: proveedoresConCalculos.length,
    totalComprado: proveedoresConCalculos.reduce((acc, p) => acc + p.totalComprado, 0),
    deudasTotales: proveedoresConCalculos.reduce(
      (acc, p) => acc + Math.max(p.deuda, 0),
      0
    ),
  };

  const items = proveedoresConCalculos.filter((p) => {
    const coincideBusqueda = q ? p.nombre.toLowerCase().includes(q) : true;
    const coincideEstado =
      estado === "con-deuda"
        ? p.deuda > 0
        : estado === "al-dia"
        ? p.deuda <= 0
        : true;
    return coincideBusqueda && coincideEstado;
  });

  return NextResponse.json({ items, resumen });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const nuevoProveedor = await prisma.proveedor.create({
      data: {
        nombre: body.nombre.trim(),
        personaContacto: body.personaContacto?.trim() || null,
        telefono: body.telefono?.trim() || null,
        email: body.email?.trim() || null,
        deudaInicial: body.deudaInicial ? Number(body.deudaInicial) : 0,
        notas: body.notas?.trim() || null,
      },
    });

    return NextResponse.json(nuevoProveedor, { status: 201 });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    return NextResponse.json({ error: "Error al crear el proveedor" }, { status: 500 });
  }
}