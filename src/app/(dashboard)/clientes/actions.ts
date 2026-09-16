"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getHistorialDeuda } from "@/lib/clientes";
import { obtenerEmpresaIdActual } from "@/lib/empresa";
import { obtenerConfiguracion } from "@/lib/configuracion";

export async function eliminarCliente(clienteId: number) { // antes: string
  try {
    const empresaId = await obtenerEmpresaIdActual();
    const cliente = await prisma.cliente.findFirst({ where: { id: clienteId, empresaId } });
    if (!cliente) {
      return { success: false as const, error: "Cliente no encontrado." };
    }
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
    const empresaId = await obtenerEmpresaIdActual();
    const cliente = await prisma.cliente.create({
      data: {
        empresaId,
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
    const empresaId = await obtenerEmpresaIdActual();
    const existente = await prisma.cliente.findFirst({ where: { id, empresaId } });
    if (!existente) {
      return { success: false as const, error: "Cliente no encontrado." };
    }

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
    const empresaId = await obtenerEmpresaIdActual();

    await prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.findFirst({ where: { id: clienteId, empresaId } });
      if (!cliente) throw new Error("CLIENTE_NO_ENCONTRADO");

      const ventasPendientes = await tx.venta.findMany({
        where: { clienteId, empresaId, estadoPago: "A_CUENTA" },
        orderBy: { fecha: "asc" },
      });

      const pendientePorVenta = new Map(
        ventasPendientes.map((v) => [v.id, v.totalARS - v.montoPagado])
      );

      for (const pago of pagosValidos) {
        const cuentaValida = await tx.cuenta.findFirst({ where: { id: pago.cuentaId, empresaId } });
        if (!cuentaValida) throw new Error("CUENTA_NO_ENCONTRADA");

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
              empresaId,
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

export async function obtenerHistorialDeuda(clienteId: number) {
  const historial = await getHistorialDeuda(clienteId);
  return historial.map((h) => ({ ...h, fecha: h.fecha.toISOString() }));
}

// --- Ajuste manual de deuda ---

type AjusteDeudaInput = {
  clienteId: number;
  tipo: "aumentar" | "reducir";
  monto: number;
  cuentaId?: number;
};

export async function ajustarDeudaManual(input: AjusteDeudaInput) {
  const { clienteId, tipo, monto, cuentaId } = input;

  if (!monto || monto <= 0) {
    return { success: false as const, error: "Ingresá un monto mayor a $0." };
  }

  const empresaId = await obtenerEmpresaIdActual();

  const cliente = await prisma.cliente.findFirst({ where: { id: clienteId, empresaId } });
  if (!cliente) {
    return { success: false as const, error: "Cliente no encontrado." };
  }

  if (tipo === "aumentar") {
    try {
      const config = await obtenerConfiguracion();
      // Mismo criterio que en ventas/actions.ts: si el negocio no opera con
      // dólares, la cotización usada es siempre 1 (totalUSD queda espejando
      // a totalARS), sin importar qué haya cargado en Configuración.
      const cotizacionRaw = config.usaCotizacionUSD ? config.cotizacionUSD : 1;
      const cotizacion = cotizacionRaw > 0 ? cotizacionRaw : 1;

      await prisma.venta.create({
        data: {
          empresaId,
          clienteId,
          fecha: new Date(),
          cotizacionUsada: cotizacion,
          totalUSD: monto / cotizacion,
          totalARS: monto,
          montoPagado: 0,
          estadoPago: "A_CUENTA",
          armado: true,   // ← agregar: no es un pedido físico, no hay nada que armar
          retirado: true, // ← agregar: no es algo que el cliente "retire"
          items: {
            create: [
              {
                descripcionLibre: "Ajuste manual de deuda",
                cantidad: 1,
                precioUnitarioUSD: monto / cotizacion,
              },
            ],
          },
        },
      });

      revalidatePath("/clientes");
      return { success: true as const };
    } catch (e) {
      console.error(e);
      return { success: false as const, error: "No se pudo registrar el ajuste." };
    }
  }

  // tipo === "reducir"
  if (!cuentaId) {
    return { success: false as const, error: "Elegí una cuenta." };
  }

  try {
    const cuentaValida = await prisma.cuenta.findFirst({ where: { id: cuentaId, empresaId } });
    if (!cuentaValida) {
      return { success: false as const, error: "La cuenta seleccionada no existe." };
    }

    let aplicadoTotal = 0;

    await prisma.$transaction(async (tx) => {
      const ventasPendientes = await tx.venta.findMany({
        where: { clienteId, empresaId, estadoPago: "A_CUENTA" },
        orderBy: { fecha: "asc" },
      });

      let restante = monto;
      const ventasTocadas: number[] = [];

      for (const venta of ventasPendientes) {
        if (restante <= 0) break;
        const pendiente = venta.totalARS - venta.montoPagado;
        if (pendiente <= 0.01) continue;

        const aplicado = Math.min(restante, pendiente);
        const nuevoPendiente = pendiente - aplicado;

        await tx.pagoVenta.create({
          data: { ventaId: venta.id, cuentaId, monto: aplicado },
        });

        await tx.venta.update({
          where: { id: venta.id },
          data: {
            montoPagado: venta.totalARS - nuevoPendiente,
            estadoPago: nuevoPendiente <= 0.01 ? "PAGADA" : "A_CUENTA",
          },
        });

        ventasTocadas.push(venta.id);
        restante -= aplicado;
      }

      aplicadoTotal = monto - restante;

      if (aplicadoTotal <= 0.01) {
        throw new Error("SIN_DEUDA_PENDIENTE");
      }

      const cuenta = await tx.cuenta.update({
        where: { id: cuentaId },
        data: { saldoActual: { increment: aplicadoTotal } },
      });

      await tx.movimientoCaja.create({
        data: {
          empresaId,
          cuentaId,
          tipo: "INGRESO",
          concepto: "OTRO",
          monto: aplicadoTotal,
          saldoResultante: cuenta.saldoActual,
          ventaId: ventasTocadas.length === 1 ? ventasTocadas[0] : null,
        },
      });
    });

    revalidatePath("/clientes");
    return { success: true as const, aplicado: aplicadoTotal };
  } catch (e) {
    if (e instanceof Error && e.message === "SIN_DEUDA_PENDIENTE") {
      return { success: false as const, error: "El cliente no tiene deuda pendiente para reducir." };
    }
    console.error(e);
    return { success: false as const, error: "Ocurrió un error al registrar el ajuste." };
  }
}