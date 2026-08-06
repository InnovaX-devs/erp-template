import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim() ?? "";
  const incluirInactivas = searchParams.get("incluirInactivas") === "true";

  const where: Prisma.CuentaWhereInput = {
    ...(incluirInactivas ? {} : { activa: true }),
    ...(q
      ? {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { alias: { contains: q, mode: "insensitive" } },
            { banco: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const items = await prisma.cuenta.findMany({
    where,
    orderBy: [{ favorita: "desc" }, { nombre: "asc" }],
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nombre?.trim() || !body.tipo) {
      return NextResponse.json(
        { error: "El nombre y el tipo de cuenta son obligatorios" },
        { status: 400 }
      );
    }

    const tiposValidos = ["EFECTIVO_ARS", "EFECTIVO_USD", "BANCO_ARS", "BANCO_USD"];
    if (!tiposValidos.includes(body.tipo)) {
      return NextResponse.json({ error: "Tipo de cuenta inválido" }, { status: 400 });
    }

    const esBanco = body.tipo === "BANCO_ARS" || body.tipo === "BANCO_USD";
    const saldoInicial = Number(body.saldoInicial || 0);

    const nuevaCuenta = await prisma.cuenta.create({
      data: {
        nombre: body.nombre.trim(),
        tipo: body.tipo,
        titular: esBanco ? body.titular?.trim() || null : null,
        banco: esBanco ? body.banco?.trim() || null : null,
        alias: esBanco ? body.alias?.trim() || null : null,
        cbu: esBanco ? body.cbu?.trim() || null : null,
        color: body.color || null,
        favorita: Boolean(body.favorita),
        saldoInicial,
        saldoActual: saldoInicial,
        limiteMensualIngresos: body.limiteMensualIngresos
          ? Number(body.limiteMensualIngresos)
          : null,
        activa: true,
      },
    });

    return NextResponse.json(nuevaCuenta, { status: 201 });
  } catch (error) {
    console.error("Error al crear cuenta:", error);
    return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 });
  }
}