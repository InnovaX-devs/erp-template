export type TipoPrecio = "MINORISTA" | "MAYORISTA" | "AMBOS";
export type TipoDocumento = "LISTA" | "CATALOGO";
export type TipoProducto = "PERFUMES" | "VAPERS" | "DECANTS";
export type Moneda = "ARS" | "USD";

export type PdfFiltros = {
  busqueda: string;
  marcaId: string;
  categoriaId: string;
  precioMin: string;
  precioMax: string;
  tipoPrecio: TipoPrecio;
  tipoProducto: TipoProducto;
  moneda: Moneda;
  documento: TipoDocumento;
};

export const FILTROS_INICIALES: PdfFiltros = {
  busqueda: "",
  marcaId: "",
  categoriaId: "",
  precioMin: "",
  precioMax: "",
  tipoPrecio: "MINORISTA",
  tipoProducto: "PERFUMES",
  moneda: "ARS",
  documento: "LISTA",
};

export function buildPdfQueryString(filtros: PdfFiltros): string {
  const params = new URLSearchParams();
  if (filtros.busqueda.trim()) params.set("q", filtros.busqueda.trim());
  if (filtros.marcaId) params.set("marcaId", filtros.marcaId);
  if (filtros.categoriaId) params.set("categoriaId", filtros.categoriaId);
  if (filtros.precioMin) params.set("precioMin", filtros.precioMin);
  if (filtros.precioMax) params.set("precioMax", filtros.precioMax);
  params.set("tipoPrecio", filtros.tipoPrecio);
  params.set("tipoProducto", filtros.tipoProducto);
  params.set("moneda", filtros.moneda);
  params.set("documento", filtros.documento);
  return params.toString();
}