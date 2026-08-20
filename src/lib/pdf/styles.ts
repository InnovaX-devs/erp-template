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
    height: 84,
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: PDF_BRAND.text,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { width: 48, height: 48, objectFit: "contain" },
  businessName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  businessDetail: { fontSize: 8, color: "#C6CAD3", marginTop: 3 },
  docTitle: { fontSize: 9, color: PDF_BRAND.primarySoft, textAlign: "right", letterSpacing: 0.5 },
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