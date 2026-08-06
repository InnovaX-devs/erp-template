"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function eliminarCliente(clienteId: number) { // antes: string
  try {
    await prisma.cliente.delete({ where: { id: clienteId } });
    revalidatePath("/clientes");
    return { success: true as const };
  } catch {
    return {
      success: false as const,
      error:
        "No se puede eliminar: el cliente tiene ventas o presupuestos asociados.",
    };
  }
}

export type ClienteInput = {
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  localidad?: string;
  esMayorista: boolean;
};

function validarCliente(data: ClienteInput) {
  if (!data.nombre?.trim()) {
    return "El nombre es obligatorio.";
  }
  return null;
}

export async function crearCliente(data: ClienteInput) {
  const errorValidacion = validarCliente(data);
  if (errorValidacion) {
    return { success: false as const, error: errorValidacion };
  }

  try {
    const cliente = await prisma.cliente.create({
      data: {
        nombre: data.nombre.trim(),
        apellido: data.apellido?.trim() || null,
        telefono: data.telefono?.trim() || null,
        email: data.email?.trim() || null,
        direccion: data.direccion?.trim() || null,
        localidad: data.localidad?.trim() || null,
        esMayorista: data.esMayorista,
      },
      select: { id: true, nombre: true, apellido: true, esMayorista: true },
    });
    revalidatePath("/clientes");
    return { success: true as const, cliente };
  } catch {
    return { success: false as const, error: "No se pudo crear el cliente." };
  }
}

export async function actualizarCliente(id: number, data: ClienteInput) { // antes: string
  const errorValidacion = validarCliente(data);
  if (errorValidacion) {
    return { success: false as const, error: errorValidacion };
  }

  try {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nombre: data.nombre.trim(),
        apellido: data.apellido?.trim() || null,
        telefono: data.telefono?.trim() || null,
        email: data.email?.trim() || null,
        direccion: data.direccion?.trim() || null,
        localidad: data.localidad?.trim() || null,
        esMayorista: data.esMayorista,
      },
      select: { id: true, nombre: true, apellido: true, esMayorista: true },
    });
    revalidatePath("/clientes");
    return { success: true as const, cliente };
  } catch {
    return { success: false as const, error: "No se pudo actualizar el cliente." };
  }
}

// --- Cobro de deuda ---

interface PagoInput {
  cuentaId: number;
  monto: number;
}

export async function cobrarDeuda(clienteId: number, pagos: PagoInput[]) {
  const pagosValidos = pagos.filter((p) => p.monto > 0);
  if (pagosValidos.length === 0) {
    return { success: false as const, error: "Ingresá un monto mayor a $0." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const ventasPendientes = await tx.venta.findMany({
        where: { clienteId, estadoPago: "A_CUENTA" },
        orderBy: { fecha: "asc" },
      });

      const pendientePorVenta = new Map(
        ventasPendientes.map((v) => [v.id, v.totalARS - v.montoPagado])
      );

      for (const pago of pagosValidos) {
        let restante = pago.monto;
        const ventasTocadas: number[] = [];

        for (const venta of ventasPendientes) {
          if (restante <= 0) break;
          const pendiente = pendientePorVenta.get(venta.id)!;
          if (pendiente <= 0.01) continue;

          const aplicado = Math.min(restante, pendiente);
          const nuevoPendiente = pendiente - aplicado;

          await tx.pagoVenta.create({
            data: { ventaId: venta.id, cuentaId: pago.cuentaId, monto: aplicado },
          });

          await tx.venta.update({
            where: { id: venta.id },
            data: {
              montoPagado: venta.totalARS - nuevoPendiente,
              estadoPago: nuevoPendiente <= 0.01 ? "PAGADA" : "A_CUENTA",
            },
          });

          pendientePorVenta.set(venta.id, nuevoPendiente);
          ventasTocadas.push(venta.id);
          restante -= aplicado;
        }

        const montoAplicado = pago.monto - restante;
        if (montoAplicado > 0.01) {
          const cuenta = await tx.cuenta.update({
            where: { id: pago.cuentaId },
            data: { saldoActual: { increment: montoAplicado } },
          });

          await tx.movimientoCaja.create({
            data: {
              cuentaId: pago.cuentaId,
              tipo: "INGRESO",
              concepto: "PAGO_DEUDA_CLIENTE",
              monto: montoAplicado,
              saldoResultante: cuenta.saldoActual,
              ventaId: ventasTocadas.length === 1 ? ventasTocadas[0] : null,
            },
          });
        }
      }
    });

    revalidatePath("/clientes");
    return { success: true as const };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "Ocurrió un error al registrar el cobro." };
  }
}