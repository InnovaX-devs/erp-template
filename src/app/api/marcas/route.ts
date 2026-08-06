import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// FIX: evita que Next.js cachee este GET como estático.
export const dynamic = "force-dynamic";

// FIX: este archivo tenía POST pero le faltaba el GET.
// Sin esto, fetch("/api/marcas") devuelve 405 y el modal
// nunca puede llenar el <select> de marcas.
export async function GET() {
  try {
    const marcas = await prisma.marca.findMany({
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(marcas);
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
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const nuevaMarca = await prisma.marca.create({
      data: { nombre: nombre.trim() },
    });

    return NextResponse.json(nuevaMarca, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear marca" }, { status: 500 });
  }
}