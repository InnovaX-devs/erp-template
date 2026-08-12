import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { obtenerConfiguracion } from "@/lib/configuracion";
import { ListaPreciosDocument } from "@/lib/pdf/ListaPreciosDocument";
import { CatalogoDocument } from "@/lib/pdf/CatalogoDocument";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const q = sp.get("q")?.trim() ?? "";
  const marcaId = sp.get("marcaId");
  const categoriaId = sp.get("categoriaId");
  const precioMin = sp.get("precioMin");
  const precioMax = sp.get("precioMax");
  const tipoPrecio = sp.get("tipoPrecio") === "MAYORISTA"
      ? "MAYORISTA"
      : sp.get("tipoPrecio") === "AMBOS"
      ? "AMBOS"
      : "MINORISTA";
  const soloDecant = sp.get("soloDecant") === "true";
  const documento = sp.get("documento") === "CATALOGO" ? "CATALOGO" : "LISTA";
  const conImagenes = sp.get("conImagenes") !== "false";

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    stockActual: { gt: 0 },
    ...(q ? { nombre: { contains: q, mode: "insensitive" } } : {}),
    ...(marcaId ? { marcaId: Number(marcaId) } : {}),
    ...(categoriaId ? { categoriaId: Number(categoriaId) } : {}),
    ...(soloDecant ? { seVendePorDecant: true } : {}),
    ...((tipoPrecio === "MINORISTA" || tipoPrecio === "AMBOS") && (precioMin || precioMax)
      ? {
          precioVenta: {
            ...(precioMin ? { gte: Number(precioMin) } : {}),
            ...(precioMax ? { lte: Number(precioMax) } : {}),
          },
        }
      : {}),
    ...(tipoPrecio === "MAYORISTA"
      ? {
          precioMayorista: {
            not: null,
            ...(precioMin ? { gte: Number(precioMin) } : {}),
            ...(precioMax ? { lte: Number(precioMax) } : {}),
          },
        }
      : {}),
  };

  const [productos, configuracion] = await Promise.all([
    prisma.producto.findMany({
      where,
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        fotoUrl: true,
        precioVenta: true,
        precioMayorista: true,
        monedaPrecio: true,
        marca: { select: { nombre: true } },
      },
    }),
    obtenerConfiguracion(),
  ]);

  const buffer =
    documento === "LISTA"
      ? await renderToBuffer(
          <ListaPreciosDocument
            productos={productos}
            configuracion={configuracion}
            tipoPrecio={tipoPrecio}
            conImagenes={conImagenes}
          />
        )
      : await renderToBuffer(
          <CatalogoDocument
            productos={productos}
            configuracion={configuracion}
            tipoPrecio={tipoPrecio}
            conImagenes={conImagenes}
          />
        );

  const filename = `${documento === "LISTA" ? "lista-precios" : "catalogo"}-${tipoPrecio.toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}