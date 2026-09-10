import type { Configuracion } from "@prisma/client";

/**
 * Paleta de colores usada en los PDFs (catálogo, comprobantes, reportes).
 * Se arma a partir de Configuracion.colorPrimario / colorSecundario, que
 * cada cliente puede cambiar desde la pantalla de Configuración. Si no
 * cargó nada, se usan estos valores neutros por defecto.
 */
const DEFAULT_PRIMARY = "#4F46E5";
const DEFAULT_SECONDARY = "#0891B2";

export type PdfBrand = {
  primary: string;
  primarySoft: string;
  accent: string;
  text: string;
  textDim: string;
  border: string;
  surfaceHover: string;
};

// Aclara un color hex mezclándolo con blanco, para derivar variantes
// (ej. "primarySoft") sin necesidad de cargar dos tonos de primario.
function aclarar(hex: string, factor: number): string {
  const limpio = hex.replace("#", "");
  if (limpio.length !== 6) return hex;

  const r = parseInt(limpio.slice(0, 2), 16);
  const g = parseInt(limpio.slice(2, 4), 16);
  const b = parseInt(limpio.slice(4, 6), 16);

  const mezclar = (canal: number) =>
    Math.round(canal + (255 - canal) * factor)
      .toString(16)
      .padStart(2, "0");

  return `#${mezclar(r)}${mezclar(g)}${mezclar(b)}`;
}

export function getPdfBrand(
  configuracion?: Pick<Configuracion, "colorPrimario" | "colorSecundario"> | null
): PdfBrand {
  const primary = configuracion?.colorPrimario || DEFAULT_PRIMARY;
  const accent = configuracion?.colorSecundario || DEFAULT_SECONDARY;

  return {
    primary,
    primarySoft: aclarar(primary, 0.35),
    accent,
    text: "#14161F",
    textDim: "#6B7280",
    border: "#E4E7EC",
    surfaceHover: "#F1F3F6",
  };
}

// Se mantiene por compatibilidad con código que todavía no migró a
// getPdfBrand(configuracion). Nuevo código siempre debería usar getPdfBrand.
export const PDF_BRAND = getPdfBrand(null);
