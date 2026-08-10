import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const FILTROS_VALIDOS = ["pendientes", "confirmadas", "canceladas"] as const;
type Filtro = (typeof FILTROS_VALIDOS)[number];

function armarWhere(filtro: string | null): Prisma.CompraWhereInput {
  switch (filtro as Filtro | null) {
    case "pendientes":
      return { confirmada: false, cancelada: false };
    case "confirmadas":
      return { confirmada: true, cancelada: false };
    case "canceladas":
      return { cancelada: true };
    default:
      return {};
  }
}

export async function GET(request: NextRequest) {
  try {
    const filtro = request.nextUrl.searchParams.get("filtro");

    const compras = await prisma.compra.findMany({
      where: armarWhere(filtro),
      orderBy: { fecha: "desc" },
      include: {
        proveedor: { select: { nombre: true } },
        cuenta: { select: { nombre: true, tipo: true } },
      },
    });

    return NextResponse.json({ items: compras });
  } catch (error: any) {
    console.error("Error al listar compras:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener las compras" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const proveedorId =
      body.proveedorId && String(body.proveedorId).trim() !== ""
        ? Number(body.proveedorId)
        : null;

    const cuentaId = Number(body.cuentaId);
    if (!Number.isFinite(cuentaId)) {
      return NextResponse.json(
        { error: "Tenés que elegir una cuenta desde la que se va a pagar la compra" },
        { status: 400 }
      );
    }

    const cuenta = await prisma.cuenta.findUnique({ where: { id: cuentaId } });
    if (!cuenta) {
      return NextResponse.json({ error: "La cuenta seleccionada no existe" }, { status: 400 });
    }
    if (!cuenta.activa) {
      return NextResponse.json(
        { error: "La cuenta seleccionada está inactiva" },
        { status: 400 }
      );
    }

    const itemsBody = Array.isArray(body.items) ? body.items : [];
    if (itemsBody.length === 0) {
      return NextResponse.json(
        { error: "La compra debe tener al menos un ítem" },
        { status: 400 }
      );
    }

    let items: { productoId: number; cantidad: number; costoUnitarioUSD: number }[];
    try {
      items = itemsBody.map((it: any) => {
        const productoId = Number(it.productoId);
        const cantidad = Number(it.cantidad);
        const costoUnitarioUSD = Number(it.costoUnitarioUSD);

        if (!Number.isFinite(productoId) || !Number.isFinite(cantidad) || cantidad <= 0) {
          throw new Error("Cada ítem necesita un producto y una cantidad mayor a 0");
        }
        if (!Number.isFinite(costoUnitarioUSD) || costoUnitarioUSD < 0) {
          throw new Error("El costo unitario en USD debe ser un número válido");
        }

        return { productoId, cantidad, costoUnitarioUSD };
      });
    } catch (validationError: any) {
      return NextResponse.json({ error: validationError.message }, { status: 400 });
    }

    const totalUSD = items.reduce((acc, it) => acc + it.cantidad * it.costoUnitarioUSD, 0);

    const compra = await prisma.compra.create({
      data: {
        proveedorId,
        cuentaId,
        totalUSD,
        confirmada: false,
        pagada: false,
        recibida: false,
        cancelada: false,
        items: {
          create: items.map((it) => ({
            productoId: it.productoId,
            cantidad: it.cantidad,
            costoUnitarioUSD: it.costoUnitarioUSD,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(compra, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear compra:", error);
    return NextResponse.json(
      { error: error.message || "Error al crear la compra" },
      { status: 500 }
    );
  }
}