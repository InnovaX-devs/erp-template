import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerEmpresaIdActual } from "@/lib/empresa";
import { obtenerConfiguracion } from "@/lib/configuracion";

export async function GET() {
  const configuracion = await obtenerConfiguracion();
  if (!configuracion.habilitarGastosFlujoCaja) {
    return NextResponse.json({ error: "Los gastos no están disponibles en tu plan actual." }, { status: 403 });
  }

  const empresaId = await obtenerEmpresaIdActual();
  const items = await prisma.categoriaGasto.findMany({
    where: { empresaId },
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  try {
    const configuracion = await obtenerConfiguracion();
    if (!configuracion.habilitarGastosFlujoCaja) {
      return NextResponse.json({ error: "Los gastos no están disponibles en tu plan actual." }, { status: 403 });
    }

    const empresaId = await obtenerEmpresaIdActual();
    const body = await request.json();

    if (!body.nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const nuevaCategoria = await prisma.categoriaGasto.create({
      data: { empresaId, nombre: body.nombre.trim() },
    });

    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 409 });
    }
    console.error("Error al crear categoría de gasto:", error);
    return NextResponse.json({ error: "Error al crear la categoría" }, { status: 500 });
  }
}