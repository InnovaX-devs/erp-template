import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma, CampoPrecio, OrigenCambioPrecio } from "@prisma/client";

export const dynamic = "force-dynamic";

const CAMPOS_VALIDOS: CampoPrecio[] = [
  "COSTO",
  "MINORISTA",
  "MAYORISTA",
  "OVERRIDE_5ML",
  "OVERRIDE_10ML",
];

const ORIGENES_VALIDOS: OrigenCambioPrecio[] = [
  "MANUAL",
  "RECALCULO_DECANT",
  "ACTUALIZACION_MASIVA",
];

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const productoQuery = sp.get("producto")?.trim() ?? "";
    const campoParam = sp.get("campo");
    const origenParam = sp.get("origen");
    const fechaDesde = sp.get("fechaDesde");
    const fechaHasta = sp.get("fechaHasta");
    const page = Math.max(1, Number(sp.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") ?? 50)));

    const campo =
      campoParam && CAMPOS_VALIDOS.includes(campoParam as CampoPrecio)
        ? (campoParam as CampoPrecio)
        : undefined;

    const origen =
      origenParam && ORIGENES_VALIDOS.includes(origenParam as OrigenCambioPrecio)
        ? (origenParam as OrigenCambioPrecio)
        : undefined;

    const where: Prisma.HistorialPrecioWhereInput = {
      ...(productoQuery
        ? { producto: { nombre: { contains: productoQuery, mode: "insensitive" } } }
        : {}),
      ...(campo ? { campo } : {}),
      ...(origen ? { origen } : {}),
      ...(fechaDesde || fechaHasta
        ? {
            fecha: {
              ...(fechaDesde ? { gte: new Date(fechaDesde) } : {}),
              ...(fechaHasta ? { lte: new Date(`${fechaHasta}T23:59:59.999`) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.historialPrecio.findMany({
        where,
        orderBy: { fecha: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          fecha: true,
          productoId: true,
          campo: true,
          valorAnterior: true,
          valorNuevo: true,
          origen: true,
          producto: { select: { id: true, nombre: true } },
        },
      }),
      prisma.historialPrecio.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error: any) {
    console.error("Error al obtener historial de precios:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener el historial de precios" },
      { status: 500 }
    );
  }
}