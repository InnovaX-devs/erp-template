import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 90,
    paddingBottom: 40,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
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
    borderBottomColor: "#E5E7EB",
  },
  logo: { width: 48, height: 48, objectFit: "contain" },
  businessName: { fontSize: 14, fontWeight: 700 },
  businessDetail: { fontSize: 8, color: "#4B5563" },
  docTitle: { fontSize: 8, color: "#6B7280", textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#9CA3AF",
    textAlign: "center",
  },
});