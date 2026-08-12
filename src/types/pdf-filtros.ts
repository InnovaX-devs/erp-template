export type TipoPrecio = "MINORISTA" | "MAYORISTA" | "AMBOS";
export type TipoDocumento = "LISTA" | "CATALOGO";

export type PdfFiltros = {
  busqueda: string;
  marcaId: string;
  categoriaId: string;
  precioMin: string;
  precioMax: string;
  tipoPrecio: TipoPrecio;
  soloDecant: boolean;
  documento: TipoDocumento;
  conImagenes: boolean;
};

export const FILTROS_INICIALES: PdfFiltros = {
  busqueda: "",
  marcaId: "",
  categoriaId: "",
  precioMin: "",
  precioMax: "",
  tipoPrecio: "MINORISTA",
  soloDecant: false,
  documento: "LISTA",
  conImagenes: true,
};

export function buildPdfQueryString(filtros: PdfFiltros): string {
  const params = new URLSearchParams();
  if (filtros.busqueda.trim()) params.set("q", filtros.busqueda.trim());
  if (filtros.marcaId) params.set("marcaId", filtros.marcaId);
  if (filtros.categoriaId) params.set("categoriaId", filtros.categoriaId);
  if (filtros.precioMin) params.set("precioMin", filtros.precioMin);
  if (filtros.precioMax) params.set("precioMax", filtros.precioMax);
  params.set("tipoPrecio", filtros.tipoPrecio);
  if (filtros.soloDecant) params.set("soloDecant", "true");
  params.set("documento", filtros.documento);
  params.set("conImagenes", String(filtros.conImagenes));
  return params.toString();
}