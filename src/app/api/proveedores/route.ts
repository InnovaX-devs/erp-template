import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Criterio de negocio (issue #59): "total comprado" y "deuda" se calculan
// a partir de compras REALES, no de un campo manual.
// Solo cuentan las compras confirmadas y no canceladas — una compra sin
// confirmar es un carrito en borrador, todavía no es una compra real.
const WHERE_COMPRA_REAL = {
  confirmada: true,
  cancelada: false,
} satisfies Prisma.CompraWhereInput;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const estado = searchParams.get("estado") ?? "todos"; // todos | con-deuda | al-dia

  // Traemos TODOS los proveedores con sus compras reales para poder:
  // 1) calcular el resumen global (siempre sobre el total, sin aplicar filtros)
  // 2) filtrar la lista después, en memoria
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
        select: { total: true, pagada: true },
      },
    },
  });

  const proveedoresConCalculos = proveedores.map((p) => {
    const cantidadCompras = p.compras.length;
    const totalComprado = p.compras.reduce((acc, c) => acc + c.total, 0);
    const deudaCompras = p.compras
      .filter((c) => !c.pagada)
      .reduce((acc, c) => acc + c.total, 0);
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
      deuda,
      alDia: deuda <= 0,
    };
  });

  // Resumen global: siempre sobre TODOS los proveedores, sin aplicar
  // busqueda/filtro de estado (mismo criterio que se usa en /api/productos)
  const resumen = {
    totalProveedores: proveedoresConCalculos.length,
    totalComprado: proveedoresConCalculos.reduce((acc, p) => acc + p.totalComprado, 0),
    deudasTotales: proveedoresConCalculos.reduce(
      (acc, p) => acc + Math.max(p.deuda, 0),
      0
    ),
  };

  // Aplicamos los filtros para la lista que se muestra en la tabla
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
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const nuevoProveedor = await prisma.proveedor.create({
      data: {
        nombre: body.nombre.trim(),
        personaContacto: body.personaContacto?.trim() || null,
        telefono: body.telefono?.trim() || null,
        email: body.email?.trim() || null,
        // Deuda previa (saldo inicial): se refleja desde el primer momento
        // porque el cálculo de deuda en GET siempre le suma este valor.
        deudaInicial: body.deudaInicial ? Number(body.deudaInicial) : 0,
        notas: body.notas?.trim() || null,
      },
    });

    return NextResponse.json(nuevoProveedor, { status: 201 });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    return NextResponse.json(
      { error: "Error al crear el proveedor" },
      { status: 500 }
    );
  }
}
