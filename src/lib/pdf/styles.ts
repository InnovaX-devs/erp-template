import { StyleSheet } from "@react-pdf/renderer";
import { PDF_BRAND } from "./brand";

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 90,
    paddingBottom: 40,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: PDF_BRAND.text,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 78,
    paddingHorizontal: 32,
    paddingTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: PDF_BRAND.border,
  },
  logo: { width: 48, height: 48, objectFit: "contain" },
  businessName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: PDF_BRAND.primary },
  businessDetail: { fontSize: 8, color: PDF_BRAND.textDim },
  docTitle: { fontSize: 8, color: PDF_BRAND.textDim, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    fontSize: 7,
    color: PDF_BRAND.textDim,
    textAlign: "center",
  },
});