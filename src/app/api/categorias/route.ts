import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categorias - Obtener todas las categorías
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { message: "Error al obtener las categorías" },
      { status: 500 }
    );
  }
}

// POST /api/categorias - Crear una nueva categoría
export async function POST(request: NextRequest) {
  try {
    const { nombre } = await request.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { message: "El nombre de la categoría es requerido" },
        { status: 400 }
      );
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: {
        nombre: nombre.trim(),
      },
    });

    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return NextResponse.json(
      { message: "Error interno al crear la categoría" },
      { status: 500 }
    );
  }
}