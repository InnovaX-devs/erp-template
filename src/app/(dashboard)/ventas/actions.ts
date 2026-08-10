"use server";

import { prisma } from "@/lib/prisma";
import type { EstadoPago, TipoPrecioVenta } from "@prisma/client";

type ItemInput = {
  productoId: number;
  cantidad: number;
  precioUnitarioArs: number;
  tipoPrecio: TipoPrecioVenta;
};

type PagoInput = {
  cuentaId: number;
  monto: number;
};

type VentaInput = {
  clienteId: number | null;
  items: ItemInput[];
  pagos: PagoInput[];
  descuentoMonto: number | null;
  descuentoPorcentaje: number | null;
  totalARS: number;
  cotizacionUSD: number;
};

type ResultadoVenta =
  | { success: true; ventaId: number }
  | { success: false; error: string };

async function crearVentaInterna(input: VentaInput, armado: boolean): Promise<ResultadoVenta> {
  if (input.items.length === 0) {
    return { success: false, error: "El carrito está vacío." };
  }

  const pagosValidos = input.pagos.filter((p) => p.cuentaId != null && p.monto > 0);
  const montoPagado = pagosValidos.reduce((acc, p) => acc + p.monto, 0);

  let estadoPago: EstadoPago;
  if (montoPagado >= input.totalARS - 0.01) {
    estadoPago = "PAGADA";
  } else {
    // Pago parcial: necesitamos cliente para poder trackear la deuda.
    if (!input.clienteId) {
      return {
        success: false,
        error: "Para dejar un saldo pendiente hace falta seleccionar un cliente.",
      };
    }
    estadoPago = "A_CUENTA";
  }

  const cotizacionUsada = input.cotizacionUSD > 0 ? input.cotizacionUSD : 1;
  const totalUSD = input.totalARS / cotizacionUsada;

  try {
    const ventaId = await prisma.$transaction(async (tx) => {
      // 1. Validar y descontar stock
      for (const item of input.items) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          select: { stockActual: true, nombre: true },
        });
        if (!producto || producto.stockActual < item.cantidad) {
          throw new Error(
            `Stock insuficiente para "${producto?.nombre ?? "producto"}" (disponible: ${producto?.stockActual ?? 0})`
          );
        }
      }

      for (const item of input.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stockActual: { decrement: item.cantidad } },
        });
      }

      // 2. Crear la venta + ítems
      const venta = await tx.venta.create({
        data: {
          clienteId: input.clienteId,
          cotizacionUsada,
          descuentoMonto: input.descuentoMonto,
          descuentoPorcentaje: input.descuentoPorcentaje,
          totalARS: input.totalARS,
          totalUSD,
          montoPagado,
          estadoPago,
          armado,
          items: {
            create: input.items.map((item) => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitarioUSD: item.precioUnitarioArs / cotizacionUsada,
              tipoPrecio: item.tipoPrecio,
            })),
          },
        },
      });

      // 3. Registrar pagos + movimientos de caja
      for (const pago of pagosValidos) {
        const cuenta = await tx.cuenta.update({
          where: { id: pago.cuentaId },
          data: { saldoActual: { increment: pago.monto } },
        });

        await tx.pagoVenta.create({
          data: { ventaId: venta.id, cuentaId: pago.cuentaId, monto: pago.monto },
        });

        await tx.movimientoCaja.create({
          data: {
            cuentaId: pago.cuentaId,
            tipo: "INGRESO",
            concepto: "VENTA_COBRADA",
            monto: pago.monto,
            saldoResultante: cuenta.saldoActual,
            ventaId: venta.id,
          },
        });
      }

      return venta.id;
    });

    return { success: true, ventaId };
  } catch (e) {
    console.error(e);
    const mensaje = e instanceof Error ? e.message : "Ocurrió un error al procesar la venta.";
    return { success: false, error: mensaje };
  }
}

export async function confirmarVenta(input: VentaInput): Promise<ResultadoVenta> {
  return crearVentaInterna(input, true);
}

export async function registrarPedido(input: VentaInput): Promise<ResultadoVenta> {
  return crearVentaInterna(input, false);
}