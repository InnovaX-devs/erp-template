import { prisma } from "@/lib/prisma";
import { Prisma, type EstadoPago } from "@prisma/client";
import {
  PRESENTACIONES_DECANT,
  calcularIngresoDecantsARS,
  calcularKpisDecants,
  formatearTagDecant,
  type KpisDecants,
  type VentaConDecants,
} from "@/lib/reportes-decants";

export type FiltrosReporteDecants = {
  estado?: "TODOS" | EstadoPago;
  desde?: string; // ISO date
  hasta?: string; // ISO date
  query?: string; // busca cliente o producto
};

export type VentaDecantListado = {
  id: number;
  fecha: Date;
  clienteNombre: string | null;
  estadoPago: EstadoPago;
  ingresoDecantsARS: number;
  tags: string[];
};

export type ReporteDecants = {
  kpis: KpisDecants;
  ventas: VentaDecantListado[];
};

export async function obtenerReporteDecants(
  filtros: FiltrosReporteDecants
): Promise<ReporteDecants> {
  const where: Prisma.VentaWhereInput = {
    items: { some: { presentacion: { in: PRESENTACIONES_DECANT } } },
  };

  if (filtros.estado && filtros.estado !== "TODOS") {
    where.estadoPago = filtros.estado;
  }

  if (filtros.desde || filtros.hasta) {
    where.fecha = {
      ...(filtros.desde ? { gte: new Date(filtros.desde) } : {}),
      ...(filtros.hasta ? { lte: new Date(filtros.hasta) } : {}),
    };
  }

  const q = filtros.query?.trim();
  if (q) {
    where.OR = [
      { cliente: { nombre: { contains: q, mode: "insensitive" } } },
      { cliente: { apellido: { contains: q, mode: "insensitive" } } },
      {
        items: {
          some: {
            presentacion: { in: PRESENTACIONES_DECANT },
            producto: { nombre: { contains: q, mode: "insensitive" } },
          },
        },
      },
    ];
  }

  const ventasRaw = await prisma.venta.findMany({
    where,
    select: {
      id: true,
      fecha: true,
      estadoPago: true,
      cotizacionUsada: true,
      cliente: { select: { nombre: true, apellido: true } },
      items: {
        where: { presentacion: { in: PRESENTACIONES_DECANT } },
        select: {
          id: true,
          presentacion: true,
          cantidad: true,
          precioUnitarioUSD: true,
          descripcionLibre: true,
          producto: { select: { nombre: true } },
        },
      },
    },
    orderBy: { fecha: "desc" },
  });

  // Nota: el `where` con items.some ya garantiza que cada venta traída tiene
  // al menos 1 ítem decant, y el `items.where` anidado hace que la relación
  // `items` de cada venta traiga SOLO los ítems decant (no los de frasco).
  const ventasConDecants: VentaConDecants[] = ventasRaw.map((v) => ({
    id: v.id,
    fecha: v.fecha,
    clienteNombre: v.cliente
      ? `${v.cliente.nombre} ${v.cliente.apellido ?? ""}`.trim()
      : null,
    estadoPago: v.estadoPago,
    cotizacionUsada: v.cotizacionUsada,
    itemsDecant: v.items.map((item) => ({
      id: item.id,
      presentacion: item.presentacion,
      cantidad: item.cantidad,
      precioUnitarioUSD: item.precioUnitarioUSD,
      productoNombre: item.producto?.nombre ?? item.descripcionLibre ?? "Ítem sin nombre",
    })),
  }));

  const kpis = calcularKpisDecants(ventasConDecants);

  const ventas: VentaDecantListado[] = ventasConDecants.map((v) => ({
    id: v.id,
    fecha: v.fecha,
    clienteNombre: v.clienteNombre,
    estadoPago: v.estadoPago,
    ingresoDecantsARS: calcularIngresoDecantsARS(v),
    tags: v.itemsDecant.map(formatearTagDecant),
  }));

  return { kpis, ventas };
}