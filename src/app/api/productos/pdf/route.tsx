import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { obtenerConfiguracion } from "@/lib/configuracion";
import { ListaPreciosDocument } from "@/lib/pdf/ListaPreciosDocument";
import { CatalogoDocument } from "@/lib/pdf/CatalogoDocument";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getVapersCategoriaId(): Promise<number | null> {
  const categoria = await prisma.categoria.findFirst({
    where: { nombre: { equals: "Vapers", mode: "insensitive" } },
    select: { id: true },
  });
  return categoria?.id ?? null;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const q = sp.get("q")?.trim() ?? "";
  const marcaId = sp.get("marcaId");
  const categoriaId = sp.get("categoriaId");
  const precioMin = sp.get("precioMin");
  const precioMax = sp.get("precioMax");

  const tipoPrecio =
    sp.get("tipoPrecio") === "MAYORISTA"
      ? "MAYORISTA"
      : sp.get("tipoPrecio") === "AMBOS"
      ? "AMBOS"
      : "MINORISTA";

  const tipoProducto =
    sp.get("tipoProducto") === "VAPERS"
      ? "VAPERS"
      : sp.get("tipoProducto") === "DECANTS"
      ? "DECANTS"
      : "PERFUMES";

  const moneda = sp.get("moneda") === "USD" ? "USD" : "ARS";
  const documento = sp.get("documento") === "CATALOGO" ? "CATALOGO" : "LISTA";
  const modoDecant = tipoProducto === "DECANTS";

  const vapersCategoriaId = await getVapersCategoriaId();

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    ...(q ? { nombre: { contains: q, mode: "insensitive" } } : {}),
    ...(marcaId ? { marcaId: Number(marcaId) } : {}),
    ...(categoriaId ? { categoriaId: Number(categoriaId) } : {}),
    ...(tipoProducto === "VAPERS"
      ? { categoriaId: vapersCategoriaId ?? -1 }
      : tipoProducto === "PERFUMES"
      ? vapersCategoriaId !== null
        ? { OR: [{ categoriaId: { not: vapersCategoriaId } }, { categoriaId: null }] }
        : {}
      : {
          seVendePorDecant: true,
          ...(vapersCategoriaId !== null
            ? { OR: [{ categoriaId: { not: vapersCategoriaId } }, { categoriaId: null }] }
            : {}),
        }),
    ...(!modoDecant && (tipoPrecio === "MINORISTA" || tipoPrecio === "AMBOS") && (precioMin || precioMax)
      ? {
          precioVenta: {
            ...(precioMin ? { gte: Number(precioMin) } : {}),
            ...(precioMax ? { lte: Number(precioMax) } : {}),
          },
        }
      : {}),
    ...(!modoDecant && tipoPrecio === "MAYORISTA"
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
        stockActual: true,
        precioVenta: true,
        precioMayorista: true,
        precioCosto: true,
        monedaPrecio: true,
        contenidoMl: true,
        overrideDecant5ml: true,
        overrideDecant10ml: true,
      },
    }),
    obtenerConfiguracion(),
  ]);

  const documentoPdf =
    documento === "LISTA" ? (
      <ListaPreciosDocument
        productos={productos}
        configuracion={configuracion}
        tipoPrecio={tipoPrecio}
        moneda={moneda}
        modoDecant={modoDecant}
      />
    ) : (
      <CatalogoDocument
        productos={productos}
        configuracion={configuracion}
        tipoPrecio={tipoPrecio}
        moneda={moneda}
        modoDecant={modoDecant}
      />
    );

  const buffer = await renderToBuffer(documentoPdf);

  const nombreTipo = tipoProducto.toLowerCase();
  const filename = `${documento === "LISTA" ? "lista-precios" : "catalogo"}-${nombreTipo}-${moneda.toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}