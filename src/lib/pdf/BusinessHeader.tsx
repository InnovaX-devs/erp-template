import { View, Text, Image } from "@react-pdf/renderer";
import { pdfStyles } from "./styles";
import { PDF_BRAND } from "./brand";
import type { Configuracion } from "@prisma/client";

export function BusinessHeader({
  configuracion,
  titulo,
}: {
  configuracion: Configuracion;
  titulo: string;
}) {
  const detalle = [configuracion.telefono, configuracion.email].filter(Boolean).join("  ·  ");

  return (
    <View style={pdfStyles.header} fixed>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {configuracion.logoUrl && (
          <Image src={configuracion.logoUrl} style={[pdfStyles.logo, { marginRight: 10 }]} />
        )}
        <View>
          <Text style={pdfStyles.businessName}>{configuracion.nombreNegocio}</Text>
          {configuracion.direccion && (
            <Text style={pdfStyles.businessDetail}>{configuracion.direccion}</Text>
          )}
          {detalle && <Text style={pdfStyles.businessDetail}>{detalle}</Text>}
        </View>
      </View>
      <View>
        <Text
          style={[
            pdfStyles.docTitle,
            { color: PDF_BRAND.primary, fontFamily: "Helvetica-Bold", fontSize: 11 },
          ]}
        >
          {titulo}
        </Text>
        <Text style={pdfStyles.docTitle}>
          {new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(new Date())}
        </Text>
      </View>
    </View>
  );
}