"use server";

import { prisma } from "@/lib/prisma";
import { calcularFechaVencimiento, calcularTotalPresupuesto } from "@/lib/presupuestos";
import type { ProductoBusqueda, ClienteBusqueda, ItemPresupuestoLocal } from "./types";

// ─────────────────────────────────────────────────────────
// TODO: reemplazar por la búsqueda real de @miladelfino cuando
// mergee su rama. Contrato esperado (ver types.ts → ProductoBusqueda):
// recibe query string, devuelve productos activos incluyendo sin stock.
// Referencia: issue #55 (este) depende de esa función.
// ─────────────────────────────────────────────────────────
export async function buscarProductos(query: string): Promise<ProductoBusqueda[]> {
  if (!query.trim()) return [];
  return prisma.producto.findMany({
    where: {
      nombre: { contains: query, mode: "insensitive" },
      activo: true,
    },
    select: {
      id: true,
      nombre: true,
      precioVenta: true,
      precioMayorista: true,
      stockActual: true,
      seVendePorDecant: true,
    },
    take: 10,
    orderBy: { nombre: "asc" },
  });
}

export async function buscarClientes(query: string): Promise<ClienteBusqueda[]> {
  if (!query.trim()) return [];
  return prisma.cliente.findMany({
    where: { nombre: { contains: query, mode: "insensitive" } },
    select: { id: true, nombre: true, apellido: true, esMayorista: true },
    take: 10,
    orderBy: { nombre: "asc" },
  });
}

export type CrearPresupuestoInput = {
  clienteId: number | null;
  vigenciaDias: number;
  observaciones: string | null;
  descuentoMonto: number | null;
  descuentoPorcentaje: number | null;
  items: ItemPresupuestoLocal[];
};

export async function crearPresupuesto(
  input: CrearPresupuestoInput
): Promise<{ success: true; id: number } | { success: false; error: string }> {
  if (input.items.length === 0) {
    return { success: false, error: "Agregá al menos un ítem al presupuesto." };
  }

  // Recalculamos server-side, nunca confiamos en lo que mandó el cliente
  const fecha = new Date();
  const fechaVencimiento = calcularFechaVencimiento(fecha, input.vigenciaDias);
  const total = calcularTotalPresupuesto(
    input.items,
    input.descuentoMonto,
    input.descuentoPorcentaje
  );

  const presupuesto = await prisma.presupuesto.create({
    data: {
      clienteId: input.clienteId,
      fecha,
      vigenciaDias: input.vigenciaDias,
      fechaVencimiento,
      observaciones: input.observaciones,
      descuentoMonto: input.descuentoMonto,
      descuentoPorcentaje: input.descuentoPorcentaje,
      total,
      estado: "BORRADOR",
      items: {
        create: input.items.map((item) => ({
          productoId: item.productoId,
          descripcion: item.descripcion,
          presentacion: item.presentacion,
          tipoPrecio: item.tipoPrecio,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
      },
    },
  });

  // Importante: acá NO se toca Producto.stockActual ni se crea MovimientoCaja.
  // Eso es justamente lo que diferencia un Presupuesto de una Venta.

  return { success: true, id: presupuesto.id };
}