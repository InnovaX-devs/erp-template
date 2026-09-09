import { StyleSheet } from "@react-pdf/renderer";
import { getPdfBrand, type PdfBrand } from "./brand";

// Antes era un StyleSheet estático calculado una sola vez con colores fijos.
// Ahora es una función: cada PDF la llama con los colores de SU
// Configuracion, así cada cliente puede tener su propia paleta.
export function getPdfStyles(brand: PdfBrand) {
  return StyleSheet.create({
    page: {
      paddingTop: 98,
      paddingBottom: 40,
      paddingHorizontal: 36,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: brand.text,
    },
    header: {
      position: "absolute",
      top: 0,
      left: 36,
      right: 36,
      height: 92,
      paddingTop: 22,
      paddingBottom: 14,
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 2,
      borderBottomColor: brand.primary,
    },
    logoBox: {
      width: 52,
      height: 52,
      marginRight: 12,
      borderWidth: 1,
      borderColor: brand.border,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    logo: { width: "100%", height: "100%", objectFit: "contain" },
    businessName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: brand.primary },
    businessDetail: { fontSize: 8.5, color: brand.textDim, marginTop: 4 },
    docTitle: {
      fontSize: 13,
      fontFamily: "Helvetica-Bold",
      color: brand.primary,
      textAlign: "right",
      letterSpacing: 0.3,
    },
    docDate: { fontSize: 8.5, color: brand.textDim, textAlign: "right", marginTop: 4 },
    footer: {
      position: "absolute",
      bottom: 16,
      left: 36,
      right: 36,
      fontSize: 7.5,
      color: brand.textDim,
      textAlign: "center",
    },
  });
}

// Compatibilidad para código no migrado todavía: paleta por defecto.
export const pdfStyles = getPdfStyles(getPdfBrand(null));
