import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// FIX: evita que Next.js cachee este GET como estático.
// Sin esto, /api/categorias puede devolver siempre la misma
// respuesta cacheada aunque se creen categorías nuevas.
export const dynamic = "force-dynamic";

// GET /api/categorias - Obtener todas las categorías con conteo de productos
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        _count: {
          select: { productos: true },
        },
      },
      orderBy: { nombre: "asc" },
    });

    const resultado = categorias.map((cat) => ({
      ...cat,
      cantidadProductos: cat._count.productos,
    }));

    return NextResponse.json(resultado);
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
        activa: true,
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