"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { EstadoPago, TipoPrecioVenta } from "@prisma/client";

type ItemInput = {
  productoId: number;
  cantidad: number;
  precioUnitarioArs: number;
  tipoPrecio: TipoPrecioVenta;
  presentacion: "FRASCO" | "DECANT_5ML" | "DECANT_10ML";
  abrioFrascoCerrado: boolean;
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
  presupuestoId?: number | null; // presente solo cuando la venta viene de "Convertir a venta"
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
      // 0. Si viene de un presupuesto, revalidar que siga siendo convertible
      //    (nadie lo convirtió en otra pestaña, y no venció mientras el
      //    usuario armaba el cobro).
      if (input.presupuestoId != null) {
        const presupuesto = await tx.presupuesto.findUnique({
          where: { id: input.presupuestoId },
          select: { estado: true, fechaVencimiento: true },
        });

        if (!presupuesto) {
          throw new Error("El presupuesto de origen ya no existe.");
        }
        if (presupuesto.estado !== "BORRADOR") {
          throw new Error("Este presupuesto ya fue convertido o ya no es un borrador.");
        }
        if (presupuesto.fechaVencimiento < new Date()) {
          throw new Error("Este presupuesto venció, no se puede convertir.");
        }
      }

      // 1. Validar y descontar stock
      // FRASCO: descuenta `cantidad` unidades. DECANT con "abrioFrascoCerrado": descuenta 1 unidad fija
      // (se abrió un solo frasco físico, sin importar cuántos decants salgan de ahí).
      for (const item of input.items) {
        const unidadesADescontar = item.presentacion === "FRASCO" ? item.cantidad : item.abrioFrascoCerrado ? 1 : 0;
        if (unidadesADescontar === 0) continue;

        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          select: { stockActual: true, nombre: true },
        });
        if (!producto || producto.stockActual < unidadesADescontar) {
          throw new Error(
            `Stock insuficiente para "${producto?.nombre ?? "producto"}" (disponible: ${producto?.stockActual ?? 0})`
          );
        }
      }

      for (const item of input.items) {
        const unidadesADescontar = item.presentacion === "FRASCO" ? item.cantidad : item.abrioFrascoCerrado ? 1 : 0;
        if (unidadesADescontar === 0) continue;

        await tx.producto.update({
          where: { id: item.productoId },
          data: { stockActual: { decrement: unidadesADescontar } },
        });
      }

      // 2. Crear la venta + ítems
      const venta = await tx.venta.create({
        data: {
          clienteId: input.clienteId,
          presupuestoId: input.presupuestoId ?? null,
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
              presentacion: item.presentacion,
              abrioFrascoCerrado: item.abrioFrascoCerrado,
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

      // 4. Marcar el presupuesto de origen como CONVERTIDO.
      //    updateMany con el estado como filtro = guard atómico contra
      //    doble conversión en carrera (dos pestañas confirmando a la vez).
      if (input.presupuestoId != null) {
        const actualizado = await tx.presupuesto.updateMany({
          where: { id: input.presupuestoId, estado: "BORRADOR" },
          data: { estado: "CONVERTIDO" },
        });
        if (actualizado.count === 0) {
          throw new Error("Este presupuesto ya fue convertido en otra pestaña.");
        }
      }

      return venta.id;
    });

    revalidatePath("/", "layout");

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