import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { BusinessHeader } from "./BusinessHeader";
import { pdfStyles } from "./styles";
import { formatCurrency } from "@/lib/currency";
import type { Configuracion } from "@prisma/client";

type ProductoLista = {
  id: number;
  nombre: string;
  marca: { nombre: string } | null;
  fotoUrl: string | null;
  precioVenta: number;
  precioMayorista: number | null;
  monedaPrecio: "ARS" | "USD";
};

const tableStyles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
    fontWeight: 700,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 5,
    alignItems: "center",
  },
  colImagen: { width: "12%", paddingRight: 6 },
  colProducto: { paddingRight: 6 },
  colMarca: { width: "22%", paddingRight: 6 },
  colPrecio: { width: "18%", textAlign: "right" },
  colPrecioDoble: { width: "16%", textAlign: "right" },
  thumb: { width: 26, height: 26, objectFit: "contain", borderRadius: 2 },
  thumbPlaceholder: { width: 26, height: 26, backgroundColor: "#F3F4F6", borderRadius: 2 },
});

function tituloPorTipo(tipoPrecio: "MINORISTA" | "MAYORISTA" | "AMBOS") {
  if (tipoPrecio === "MINORISTA") return "Lista de Precios";
  if (tipoPrecio === "MAYORISTA") return "Lista de Precios Mayorista";
  return "Lista de Precios (Minorista y Mayorista)";
}

export function ListaPreciosDocument({
  productos,
  configuracion,
  tipoPrecio,
  conImagenes,
}: {
  productos: ProductoLista[];
  configuracion: Configuracion;
  tipoPrecio: "MINORISTA" | "MAYORISTA" | "AMBOS";
  conImagenes: boolean;
}) {
  const titulo = tituloPorTipo(tipoPrecio);
  const esAmbos = tipoPrecio === "AMBOS";

  const colProductoWidth = conImagenes
    ? esAmbos
      ? "32%"
      : "43%"
    : esAmbos
    ? "44%"
    : "55%";

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <BusinessHeader configuracion={configuracion} titulo={titulo} />

        <View style={tableStyles.headerRow}>
          {conImagenes && <Text style={tableStyles.colImagen}>Foto</Text>}
          <Text style={[tableStyles.colProducto, { width: colProductoWidth }]}>Producto</Text>
          <Text style={tableStyles.colMarca}>Marca</Text>
          {esAmbos ? (
            <>
              <Text style={tableStyles.colPrecioDoble}>Minorista</Text>
              <Text style={tableStyles.colPrecioDoble}>Mayorista</Text>
            </>
          ) : (
            <Text style={tableStyles.colPrecio}>Precio</Text>
          )}
        </View>

        {productos.map((p) => (
          <View key={p.id} style={tableStyles.row} wrap={false}>
            {conImagenes && (
              <View style={tableStyles.colImagen}>
                {p.fotoUrl ? (
                  <Image src={p.fotoUrl} style={tableStyles.thumb} />
                ) : (
                  <View style={tableStyles.thumbPlaceholder} />
                )}
              </View>
            )}
            <Text style={[tableStyles.colProducto, { width: colProductoWidth }]}>{p.nombre}</Text>
            <Text style={tableStyles.colMarca}>{p.marca?.nombre ?? "-"}</Text>
            {esAmbos ? (
              <>
                <Text style={tableStyles.colPrecioDoble}>
                  {formatCurrency(p.precioVenta, p.monedaPrecio)}
                </Text>
                <Text style={tableStyles.colPrecioDoble}>
                  {p.precioMayorista !== null ? formatCurrency(p.precioMayorista, p.monedaPrecio) : "—"}
                </Text>
              </>
            ) : (
              <Text style={tableStyles.colPrecio}>
                {formatCurrency(
                  tipoPrecio === "MINORISTA" ? p.precioVenta : (p.precioMayorista as number),
                  p.monedaPrecio
                )}
              </Text>
            )}
          </View>
        ))}

        <Text
          style={pdfStyles.footer}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}