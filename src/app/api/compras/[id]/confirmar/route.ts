import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularCostoPromedioPonderado } from "@/lib/calculos/costoPromedioPonderado";
import type { Prisma } from "@prisma/client";

const TIPOS_CUENTA_USD = ["EFECTIVO_USD", "BANCO_USD"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const compraId = Number(id);

    if (isNaN(compraId)) {
      return NextResponse.json(
        { error: "El ID de la compra debe ser un número válido" },
        { status: 400 }
      );
    }

    const compra = await prisma.compra.findUnique({
      where: { id: compraId },
      include: { items: true, cuenta: true },
    });

    if (!compra) {
      return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 });
    }
    if (compra.cancelada) {
      return NextResponse.json(
        { error: "No se puede confirmar una compra cancelada" },
        { status: 400 }
      );
    }
    if (compra.confirmada) {
      return NextResponse.json({ error: "La compra ya fue confirmada" }, { status: 400 });
    }
    if (compra.items.length === 0) {
      return NextResponse.json({ error: "La compra no tiene ítems" }, { status: 400 });
    }

    const config = await prisma.configuracion.findUnique({
      where: { id: "singleton" },
      select: { costoPromedioPonderado: true, cotizacionUSD: true },
    });
    const usarPonderado = config?.costoPromedioPonderado ?? true;
    const cotizacion = config?.cotizacionUSD ?? 1000;

    const totalARS = compra.totalUSD * cotizacion;
    const cuentaEsUSD = TIPOS_CUENTA_USD.includes(compra.cuenta.tipo);
    const montoADebitar = cuentaEsUSD ? compra.totalUSD : totalARS;
    const nuevoSaldoCuenta = compra.cuenta.saldoActual - montoADebitar;

    const compraActualizada = await prisma.$transaction(async (tx) => {
      for (const item of compra.items) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          select: { id: true, stockActual: true, precioCosto: true, monedaPrecio: true },
        });

        if (!producto) {
          throw new Error(`El producto ${item.productoId} de la compra ya no existe`);
        }

        const nuevoStock = producto.stockActual + item.cantidad;
        const dataUpdate: Prisma.ProductoUpdateInput = { stockActual: nuevoStock };

        if (usarPonderado) {
          // El ítem de compra siempre se carga en USD; si el producto
          // lleva su costo en ARS, convertimos antes de promediar para
          // no mezclar monedas en el cálculo.
          const costoNuevoEnMonedaProducto =
            producto.monedaPrecio === "ARS"
              ? item.costoUnitarioUSD * cotizacion
              : item.costoUnitarioUSD;

          const nuevoCosto = calcularCostoPromedioPonderado({
            stockActual: producto.stockActual,
            costoActual: producto.precioCosto,
            cantidadNueva: item.cantidad,
            costoNuevo: costoNuevoEnMonedaProducto,
          });

          if (nuevoCosto !== producto.precioCosto) {
            dataUpdate.precioCosto = nuevoCosto;

            await tx.historialPrecio.create({
              data: {
                productoId: producto.id,
                campo: "COSTO",
                valorAnterior: producto.precioCosto,
                valorNuevo: nuevoCosto,
                origen: "COMPRA_CONFIRMADA",
                detalle: `Compra #${compra.id} confirmada (costo promedio ponderado)`,
              },
            });
          }
        }

        await tx.producto.update({ where: { id: producto.id }, data: dataUpdate });
      }

      // Movimiento de caja: recién ahora sale la plata.
      await tx.cuenta.update({
        where: { id: compra.cuentaId },
        data: { saldoActual: nuevoSaldoCuenta },
      });

      await tx.movimientoCaja.create({
        data: {
          cuentaId: compra.cuentaId,
          tipo: "EGRESO",
          concepto: "PAGO_A_PROVEEDOR",
          monto: montoADebitar,
          saldoResultante: nuevoSaldoCuenta,
          compraId: compra.id,
        },
      });

      return tx.compra.update({
        where: { id: compra.id },
        data: {
          confirmada: true,
          recibida: true,
          pagada: true,
          cotizacionUsada: cotizacion,
          totalARS,
        },
        include: { items: true },
      });
    });

    return NextResponse.json(compraActualizada);
  } catch (error: any) {
    console.error("Error al confirmar compra:", error);
    return NextResponse.json(
      { error: error.message || "Error al confirmar la compra" },
      { status: 500 }
    );
  }
}