import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { BusinessHeader } from "./BusinessHeader";
import { pdfStyles } from "./styles";
import { formatCurrency } from "@/lib/currency";
import { calcularPrecioDecant } from "@/lib/calculos/decant-pricing";
import { PDF_BRAND } from "./brand";
import type { Configuracion } from "@prisma/client";

type ProductoCatalogo = {
  id: number;
  nombre: string;
  fotoUrl: string | null;
  fotoDataUri: string | null;
  stockActual: number;
  precioVenta: number;
  precioMayorista: number | null;
  precioCosto: number;
  monedaPrecio: "ARS" | "USD";
  contenidoMl: number | null;
  overrideDecant5ml: number | null;
  overrideDecant10ml: number | null;
};

// Cantidad fija de cards por fila. Si en algún momento cambian el tamaño
// de las cards en los estilos, ajustar esto junto con el ancho/margen
// calculados en renderGrid.
const CARDS_POR_FILA = 4;

function chunk<T>(items: T[], size: number): T[][] {
  const filas: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    filas.push(items.slice(i, i + size));
  }
  return filas;
}

const cardStyles = StyleSheet.create({
  // Cada fila es un bloque explícito con wrap={false}: si no entra completa
  // en lo que queda de la página, se mueve entera a la siguiente. Esto
  // evita el bug de react-pdf donde flexWrap + wrap={false} por card deja
  // huecos en blanco cuando una card individual salta de página.
  row: { flexDirection: "row", justifyContent: "flex-start" },
  card: {
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: PDF_BRAND.border,
    borderRadius: 4,
    padding: 6,
    alignItems: "center",
  },
  cardSinStock: {
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    borderRadius: 4,
    padding: 6,
    alignItems: "center",
  },
  imageBox: {
    width: "100%",
    height: 75,
    marginBottom: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
    overflow: "hidden",
  },
  imageBoxPlaceholder: {
    width: "100%",
    height: 75,
    marginBottom: 5,
    backgroundColor: PDF_BRAND.surfaceHover,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
  },
  image: { width: "100%", height: 75, objectFit: "contain" },
  placeholderText: { fontSize: 6.5, color: PDF_BRAND.textDim },
  nombre: { fontSize: 7.5, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 3 },
  nombreSinStock: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 3,
    color: "#DC2626",
  },
  precioLinea: { fontSize: 7, textAlign: "center" },
  precioValor: { fontFamily: "Helvetica-Bold" },
  frasco: { fontSize: 6, color: PDF_BRAND.textDim, marginTop: 2 },
  sectionSeparator: {
    width: "100%",
    marginTop: 6,
    marginBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#FCA5A5",
  },
  sectionLabel: { fontSize: 8.5, fontStyle: "italic", color: "#DC2626" },
});

function convertir(valor: number, monedaOrigen: "ARS" | "USD", monedaDestino: "ARS" | "USD", cotizacionUSD: number) {
  if (monedaOrigen === monedaDestino) return valor;
  return monedaDestino === "ARS" ? valor * cotizacionUSD : valor / cotizacionUSD;
}

export function CatalogoDocument({
  productos,
  configuracion,
  tipoPrecio,
  moneda,
  modoDecant,
}: {
  productos: ProductoCatalogo[];
  configuracion: Configuracion;
  tipoPrecio: "MINORISTA" | "MAYORISTA" | "AMBOS";
  moneda: "ARS" | "USD";
  modoDecant: boolean;
}) {
  const titulo = modoDecant
    ? "Catálogo de Decants"
    : tipoPrecio === "MINORISTA"
    ? "Catálogo de Productos"
    : tipoPrecio === "MAYORISTA"
    ? "Catálogo Mayorista"
    : "Catálogo (Minorista y Mayorista)";

  const accent = modoDecant ? PDF_BRAND.accent : PDF_BRAND.primary;

  const conStock = productos.filter((p) => p.stockActual > 0);
  const sinStock = productos.filter((p) => p.stockActual <= 0);

  function renderPrecios(p: ProductoCatalogo, colorAccent: string) {
    if (modoDecant) {
      const { precio5ml, precio10ml } = calcularPrecioDecant(p, configuracion);
      const p5 = precio5ml !== null ? convertir(precio5ml, "ARS", moneda, configuracion.cotizacionUSD) : null;
      const p10 = precio10ml !== null ? convertir(precio10ml, "ARS", moneda, configuracion.cotizacionUSD) : null;
      return (
        <>
          <Text style={cardStyles.precioLinea}>
            5ml{" "}
            <Text style={[cardStyles.precioValor, { color: colorAccent }]}>
              {p5 !== null ? formatCurrency(p5, moneda) : "N/D"}
            </Text>
          </Text>
          <Text style={cardStyles.precioLinea}>
            10ml{" "}
            <Text style={[cardStyles.precioValor, { color: colorAccent }]}>
              {p10 !== null ? formatCurrency(p10, moneda) : "N/D"}
            </Text>
          </Text>
          {p.contenidoMl && <Text style={cardStyles.frasco}>Frasco {p.contenidoMl}ml</Text>}
        </>
      );
    }

    if (tipoPrecio === "AMBOS") {
      return (
        <>
          <Text style={cardStyles.precioLinea}>
            Min{" "}
            <Text style={[cardStyles.precioValor, { color: colorAccent }]}>
              {formatCurrency(convertir(p.precioVenta, p.monedaPrecio, moneda, configuracion.cotizacionUSD), moneda)}
            </Text>
          </Text>
          <Text style={cardStyles.precioLinea}>
            May{" "}
            <Text style={[cardStyles.precioValor, { color: colorAccent }]}>
              {p.precioMayorista !== null
                ? formatCurrency(convertir(p.precioMayorista, p.monedaPrecio, moneda, configuracion.cotizacionUSD), moneda)
                : "—"}
            </Text>
          </Text>
        </>
      );
    }

    return (
      <Text style={[cardStyles.precioLinea, cardStyles.precioValor, { color: colorAccent, fontSize: 9 }]}>
        {formatCurrency(
          convertir(
            tipoPrecio === "MINORISTA" ? p.precioVenta : (p.precioMayorista as number),
            p.monedaPrecio,
            moneda,
            configuracion.cotizacionUSD
          ),
          moneda
        )}
      </Text>
    );
  }

  function renderGrid(items: ProductoCatalogo[], sinStockFlag: boolean) {
    const filas = chunk(items, CARDS_POR_FILA);

    return filas.map((fila, filaIndex) => (
      <View key={filaIndex} style={cardStyles.row} wrap={false}>
        {fila.map((p, i) => {
          const esUltimaDeLaFila = i === fila.length - 1;
          const estiloPosicion = {
            width: "23.5%" as const,
            marginRight: esUltimaDeLaFila ? 0 : "2%",
          };
          return (
            <View
              key={p.id}
              style={[sinStockFlag ? cardStyles.cardSinStock : cardStyles.card, estiloPosicion]}
            >
              <View style={p.fotoDataUri ? cardStyles.imageBox : cardStyles.imageBoxPlaceholder}>
                {p.fotoDataUri ? (
                  <Image src={p.fotoDataUri} style={cardStyles.image} />
                ) : (
                  <Text style={cardStyles.placeholderText}>Sin foto</Text>
                )}
              </View>
              <Text style={sinStockFlag ? cardStyles.nombreSinStock : cardStyles.nombre}>{p.nombre}</Text>
              {renderPrecios(p, sinStockFlag ? "#DC2626" : accent)}
            </View>
          );
        })}
      </View>
    ));
  }

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <BusinessHeader configuracion={configuracion} titulo={titulo} />

        {renderGrid(conStock, false)}

        {sinStock.length > 0 && (
          <>
            <View style={cardStyles.sectionSeparator}>
              <Text style={cardStyles.sectionLabel}>Sin stock actualmente — consultar disponibilidad</Text>
            </View>
            {renderGrid(sinStock, true)}
          </>
        )}

        <Text
          style={pdfStyles.footer}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}