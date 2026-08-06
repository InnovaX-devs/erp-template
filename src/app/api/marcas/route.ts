import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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