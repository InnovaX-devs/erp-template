import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { obtenerConfiguracion } from "@/lib/configuracion";
import { ListaPreciosDocument } from "@/lib/pdf/ListaPreciosDocument";
import { CatalogoDocument } from "@/lib/pdf/CatalogoDocument";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TipoDocumentoPdf =
  | "LISTA_GENERAL"
  | "LISTA_MAYORISTA"
  | "CATALOGO"
  | "CATALOGO_MAYORISTA"
  | "CATALOGO_DECANTS";

const SIN_CATEGORIA = "SIN_CATEGORIA";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const moneda = sp.get("moneda") === "USD" ? "USD" : "ARS";
  const tipoDocumento = (sp.get("tipoDocumento") as TipoDocumentoPdf) ?? "LISTA_GENERAL";

  const documento = tipoDocumento.startsWith("CATALOGO") ? "CATALOGO" : "LISTA";
  const modoDecant = tipoDocumento === "CATALOGO_DECANTS";
  const tipoPrecio: "MINORISTA" | "MAYORISTA" = tipoDocumento.endsWith("MAYORISTA")
    ? "MAYORISTA"
    : "MINORISTA";

  // Categorías a EXCLUIR. "SIN_CATEGORIA" es un valor especial (no es un id
  // real de la tabla Categoria) que representa a los productos sin categoría
  // asignada (categoriaId = NULL).
  const excluidosRaw = sp.get("categoriasExcluidas")
    ? sp.get("categoriasExcluidas")!.split(",")
    : [];
  const excluirSinCategoria = excluidosRaw.includes(SIN_CATEGORIA);
  const categoriasExcluidas = excluidosRaw
    .filter((v) => v !== SIN_CATEGORIA)
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));

  // En SQL, "categoriaId NOT IN (...)" excluye por sí solo las filas con
  // categoriaId = NULL. Por eso armamos el filtro a mano según los 4 casos
  // posibles, en vez de confiar en ese comportamiento implícito.
  let filtroCategoria: Prisma.ProductoWhereInput = {};
  if (categoriasExcluidas.length > 0 && excluirSinCategoria) {
    // Excluir categorías puntuales Y excluir sin-categoría:
    // el NOT IN ya deja afuera los NULL, así que alcanza con esto.
    filtroCategoria = { categoriaId: { notIn: categoriasExcluidas } };
  } else if (categoriasExcluidas.length > 0 && !excluirSinCategoria) {
    // Excluir categorías puntuales pero CONSERVAR los sin categoría.
    filtroCategoria = {
      OR: [{ categoriaId: { notIn: categoriasExcluidas } }, { categoriaId: null }],
    };
  } else if (categoriasExcluidas.length === 0 && excluirSinCategoria) {
    // Solo excluir los que no tienen categoría.
    filtroCategoria = { categoriaId: { not: null } };
  }
  // Si no hay nada excluido, filtroCategoria queda {} (no se filtra nada).

  const where: Prisma.ProductoWhereInput = {
    activo: true,
    ...filtroCategoria,
    ...(modoDecant ? { seVendePorDecant: true } : {}),
    ...(!modoDecant && tipoPrecio === "MAYORISTA" ? { precioMayorista: { not: null } } : {}),
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

  if (productos.length === 0) {
    const mensaje = modoDecant
      ? "No hay productos que se vendan por decant con los filtros seleccionados."
      : "No hay productos que coincidan con los filtros seleccionados.";
    return NextResponse.json({ error: mensaje }, { status: 404 });
  }

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

  const sufijo = tipoDocumento.toLowerCase().replace(/_/g, "-");
  const filename = `${sufijo}-${moneda.toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}