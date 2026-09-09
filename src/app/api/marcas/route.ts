import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// FIX: evita que Next.js cachee este GET como estático.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const marcas = await prisma.marca.findMany({
      include: {
        _count: {
          select: { productos: true },
        },
      },
      orderBy: { nombre: "asc" },
    });

    // Mapeamos para devolver la propiedad 'cantidadProductos' lista para consumir en el frontend
    const resultado = marcas.map((marca) => ({
      ...marca,
      cantidadProductos: marca._count.productos,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al obtener marcas:", error);
    return NextResponse.json(
      { message: "Error al obtener las marcas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre } = await request.json();
    if (!nombre?.trim()) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const nuevaMarca = await prisma.marca.create({
      data: {
        nombre: nombre.trim(),
        activa: true,
      },
    });

    return NextResponse.json(nuevaMarca, { status: 201 });
  } catch (error) {
    console.error("Error al crear marca:", error);
    return NextResponse.json(
      { error: "Error al crear la marca" },
      { status: 500 }
    );
  }
}