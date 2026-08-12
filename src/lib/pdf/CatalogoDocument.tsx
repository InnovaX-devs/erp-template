import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { BusinessHeader } from "./BusinessHeader";
import { pdfStyles } from "./styles";
import { formatCurrency } from "@/lib/currency";
import type { Configuracion } from "@prisma/client";

type ProductoCatalogo = {
  id: number;
  nombre: string;
  marca: { nombre: string } | null;
  fotoUrl: string | null;
  precioVenta: number;
  precioMayorista: number | null;
  monedaPrecio: "ARS" | "USD";
};

const cardStyles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cardConImagen: {
    width: "31%",
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 8,
  },
  cardSinImagen: {
    width: "48%",
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    padding: 10,
  },
  imageBox: {
    width: "100%",
    height: 90,
    marginBottom: 6,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
  },
  image: { width: "100%", height: 90, objectFit: "contain" },
  placeholderText: { fontSize: 7, color: "#9CA3AF" },
  nombre: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  marca: { fontSize: 7.5, color: "#6B7280", marginBottom: 3 },
  precio: { fontSize: 9.5, fontWeight: 700 },
  preciosRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  precioBox: { width: "48%" },
  precioLabel: { fontSize: 6.5, color: "#6B7280" },
  precioValor: { fontSize: 9, fontWeight: 700 },
});

function tituloPorTipo(tipoPrecio: "MINORISTA" | "MAYORISTA" | "AMBOS") {
  if (tipoPrecio === "MINORISTA") return "Catálogo de Productos";
  if (tipoPrecio === "MAYORISTA") return "Catálogo Mayorista";
  return "Catálogo (Minorista y Mayorista)";
}

export function CatalogoDocument({
  productos,
  configuracion,
  tipoPrecio,
  conImagenes,
}: {
  productos: ProductoCatalogo[];
  configuracion: Configuracion;
  tipoPrecio: "MINORISTA" | "MAYORISTA" | "AMBOS";
  conImagenes: boolean;
}) {
  const titulo = tituloPorTipo(tipoPrecio);
  const esAmbos = tipoPrecio === "AMBOS";
  const cardStyle = conImagenes ? cardStyles.cardConImagen : cardStyles.cardSinImagen;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <BusinessHeader configuracion={configuracion} titulo={titulo} />

        <View style={cardStyles.grid}>
          {productos.map((p) => (
            <View key={p.id} style={cardStyle} wrap={false}>
              {conImagenes && (
                <View style={cardStyles.imageBox}>
                  {p.fotoUrl ? (
                    <Image src={p.fotoUrl} style={cardStyles.image} />
                  ) : (
                    <Text style={cardStyles.placeholderText}>Sin foto</Text>
                  )}
                </View>
              )}
              <Text style={cardStyles.nombre}>{p.nombre}</Text>
              <Text style={cardStyles.marca}>{p.marca?.nombre ?? "-"}</Text>

              {esAmbos ? (
                <View style={cardStyles.preciosRow}>
                  <View style={cardStyles.precioBox}>
                    <Text style={cardStyles.precioLabel}>Minorista</Text>
                    <Text style={cardStyles.precioValor}>
                      {formatCurrency(p.precioVenta, p.monedaPrecio)}
                    </Text>
                  </View>
                  <View style={cardStyles.precioBox}>
                    <Text style={cardStyles.precioLabel}>Mayorista</Text>
                    <Text style={cardStyles.precioValor}>
                      {p.precioMayorista !== null
                        ? formatCurrency(p.precioMayorista, p.monedaPrecio)
                        : "—"}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={cardStyles.precio}>
                  {formatCurrency(
                    tipoPrecio === "MINORISTA" ? p.precioVenta : (p.precioMayorista as number),
                    p.monedaPrecio
                  )}
                </Text>
              )}
            </View>
          ))}
        </View>

        <Text
          style={pdfStyles.footer}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}