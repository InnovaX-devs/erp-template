import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { BusinessHeader } from "./BusinessHeader";
import { pdfStyles } from "./styles";
import { formatCurrency } from "@/lib/currency";
import { calcularPrecioDecant } from "@/lib/calculos/decant-pricing"
import { PDF_BRAND } from "./brand";
import type { Configuracion } from "@prisma/client";

type ProductoLista = {
  id: number;
  nombre: string;
  stockActual: number;
  precioVenta: number;
  precioMayorista: number | null;
  precioCosto: number;
  monedaPrecio: "ARS" | "USD";
  contenidoMl: number | null;
  overrideDecant5ml: number | null;
  overrideDecant10ml: number | null;
};

const listStyles = StyleSheet.create({
  sectionSeparator: {
    marginTop: 14,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: PDF_BRAND.border,
  },
  sectionLabel: { fontSize: 8.5, fontStyle: "italic", color: PDF_BRAND.textDim },
  row: { flexDirection: "row", marginBottom: 3 },
  cell: { width: "50%", flexDirection: "row", justifyContent: "space-between", paddingRight: 10 },
  nombre: { fontSize: 8.5, flexShrink: 1, paddingRight: 6 },
  precio: { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  nombreSinStock: { fontSize: 8.5, flexShrink: 1, paddingRight: 6, color: "#DC2626" },
  precioSinStock: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#DC2626",
    textDecoration: "line-through",
  },
});

function convertir(valor: number, monedaOrigen: "ARS" | "USD", monedaDestino: "ARS" | "USD", cotizacionUSD: number) {
  if (monedaOrigen === monedaDestino) return valor;
  return monedaDestino === "ARS" ? valor * cotizacionUSD : valor / cotizacionUSD;
}

function chunkEnPares<T>(items: T[]): [T, T | null][] {
  const pares: [T, T | null][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pares.push([items[i], items[i + 1] ?? null]);
  }
  return pares;
}

export function ListaPreciosDocument({
  productos,
  configuracion,
  tipoPrecio,
  moneda,
  modoDecant,
}: {
  productos: ProductoLista[];
  configuracion: Configuracion;
  tipoPrecio: "MINORISTA" | "MAYORISTA" | "AMBOS";
  moneda: "ARS" | "USD";
  modoDecant: boolean;
}) {
  const titulo = modoDecant
    ? "Lista de Precios — Decants"
    : tipoPrecio === "MINORISTA"
    ? "Lista de Precios"
    : tipoPrecio === "MAYORISTA"
    ? "Lista de Precios Mayorista"
    : "Lista de Precios (Minorista y Mayorista)";

  function precioTexto(p: ProductoLista): string {
    if (modoDecant) {
      const { precio5ml, precio10ml } = calcularPrecioDecant(p, configuracion);
      const p5 = precio5ml !== null ? convertir(precio5ml, "ARS", moneda, configuracion.cotizacionUSD) : null;
      const p10 = precio10ml !== null ? convertir(precio10ml, "ARS", moneda, configuracion.cotizacionUSD) : null;
      return `5ml ${p5 !== null ? formatCurrency(p5, moneda) : "N/D"} · 10ml ${p10 !== null ? formatCurrency(p10, moneda) : "N/D"}`;
    }
    if (tipoPrecio === "AMBOS") {
      const min = formatCurrency(convertir(p.precioVenta, p.monedaPrecio, moneda, configuracion.cotizacionUSD), moneda);
      const may =
        p.precioMayorista !== null
          ? formatCurrency(convertir(p.precioMayorista, p.monedaPrecio, moneda, configuracion.cotizacionUSD), moneda)
          : "—";
      return `Min ${min} · May ${may}`;
    }
    const valor = tipoPrecio === "MINORISTA" ? p.precioVenta : (p.precioMayorista as number);
    return formatCurrency(convertir(valor, p.monedaPrecio, moneda, configuracion.cotizacionUSD), moneda);
  }

  const conStock = productos.filter((p) => p.stockActual > 0);
  const sinStock = productos.filter((p) => p.stockActual <= 0);

  function renderGrupo(items: ProductoLista[], sinStock: boolean = false) {
    return chunkEnPares(items).map(([a, b], i) => (
      <View key={i} style={listStyles.row}>
        <View style={listStyles.cell}>
          <Text style={sinStock ? listStyles.nombreSinStock : listStyles.nombre}>{a.nombre}</Text>
          <Text style={sinStock ? listStyles.precioSinStock : [listStyles.precio, { color: PDF_BRAND.primary }]}>
            {precioTexto(a)}
          </Text>
        </View>
        <View style={listStyles.cell}>
          {b && (
            <>
              <Text style={sinStock ? listStyles.nombreSinStock : listStyles.nombre}>{b.nombre}</Text>
              <Text style={sinStock ? listStyles.precioSinStock : [listStyles.precio, { color: PDF_BRAND.primary }]}>
                {precioTexto(b)}
              </Text>
            </>
          )}
        </View>
      </View>
    ));
  }

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <BusinessHeader configuracion={configuracion} titulo={titulo} />

        {renderGrupo(conStock)}

        {sinStock.length > 0 && (
          <>
            <View style={listStyles.sectionSeparator}>
              <Text style={listStyles.sectionLabel}>Sin stock actualmente — consultar disponibilidad</Text>
            </View>
            {renderGrupo(sinStock, true)}
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