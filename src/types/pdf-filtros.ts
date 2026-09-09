export type TipoDocumentoPdf =
  | "LISTA_GENERAL"
  | "LISTA_MAYORISTA"
  | "CATALOGO"
  | "CATALOGO_MAYORISTA"
  | "CATALOGO_DECANTS";

export type Moneda = "ARS" | "USD";

export type PdfFiltros = {
  tipoDocumento: TipoDocumentoPdf;
  categoriasExcluidas: string[];
  moneda: Moneda;
};

export const FILTROS_INICIALES: PdfFiltros = {
  tipoDocumento: "LISTA_GENERAL",
  categoriasExcluidas: [],
  moneda: "ARS",
};

export function buildPdfQueryString(filtros: PdfFiltros): string {
  const params = new URLSearchParams();
  params.set("tipoDocumento", filtros.tipoDocumento);
  if (filtros.categoriasExcluidas.length > 0) {
    params.set("categoriasExcluidas", filtros.categoriasExcluidas.join(","));
  }
  params.set("moneda", filtros.moneda);
  return params.toString();
}