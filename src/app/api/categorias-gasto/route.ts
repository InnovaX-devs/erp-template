import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.categoriaGasto.findMany({
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nombre?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const nuevaCategoria = await prisma.categoriaGasto.create({
      data: { nombre: body.nombre.trim() },
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