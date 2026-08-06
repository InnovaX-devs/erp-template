import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const proveedorId =
      body.proveedorId && String(body.proveedorId).trim() !== ""
        ? Number(body.proveedorId)
        : null;

    const tipoPago = ["CUENTA", "EFECTIVO", "TRANSFERENCIA"].includes(body.tipoPago)
      ? body.tipoPago
      : null;

    if (!tipoPago) {
      return NextResponse.json(
        { error: "El tipo de pago es obligatorio (Cuenta, Efectivo o Transferencia)" },
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

    let items: { productoId: number; cantidad: number; costoUnitario: number }[];
    try {
      items = itemsBody.map((it: any) => {
        const productoId = Number(it.productoId);
        const cantidad = Number(it.cantidad);
        const costoUnitario = Number(it.costoUnitario);

        if (!Number.isFinite(productoId) || !Number.isFinite(cantidad) || cantidad <= 0) {
          throw new Error("Cada ítem necesita un producto y una cantidad mayor a 0");
        }
        if (!Number.isFinite(costoUnitario) || costoUnitario < 0) {
          throw new Error("El costo unitario debe ser un número válido");
        }

        return { productoId, cantidad, costoUnitario };
      });
    } catch (validationError: any) {
      return NextResponse.json({ error: validationError.message }, { status: 400 });
    }

    const total = items.reduce((acc, it) => acc + it.cantidad * it.costoUnitario, 0);

    // Se crea SIN confirmar (issue #60). El impacto en stock/costo y el
    // pasaje a confirmada=true/recibida=true lo hace el issue #61, en un
    // endpoint aparte (POST /api/compras/[id]/confirmar) que todavía no
    // existe.
    const compra = await prisma.compra.create({
      data: {
        proveedorId,
        tipoPago,
        total,
        confirmada: false,
        pagada: false,
        recibida: false,
        cancelada: false,
        items: {
          create: items.map((it) => ({
            productoId: it.productoId,
            cantidad: it.cantidad,
            costoUnitario: it.costoUnitario,
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