"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function eliminarCliente(clienteId: string) {
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

export async function actualizarCliente(id: string, data: ClienteInput) {
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