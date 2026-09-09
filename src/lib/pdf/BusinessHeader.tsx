import { View, Text, Image } from "@react-pdf/renderer";
import { pdfStyles } from "./styles";
import type { Configuracion } from "@prisma/client";

const INSTAGRAM_HANDLE = "@importtados.kj";

export function BusinessHeader({
  configuracion,
  titulo,
}: {
  configuracion: Configuracion;
  titulo: string;
}) {
  const detalle = [
    INSTAGRAM_HANDLE,
    configuracion.telefono ? `Tel: ${configuracion.telefono}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <View style={pdfStyles.header} fixed>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={pdfStyles.logoBox}>
          {configuracion.logoUrl ? (
            <Image src={configuracion.logoUrl} style={pdfStyles.logo} />
          ) : null}
        </View>
        <View>
          <Text style={pdfStyles.businessName}>{configuracion.nombreNegocio}</Text>
          {detalle && <Text style={pdfStyles.businessDetail}>{detalle}</Text>}
        </View>
      </View>
      <View>
        <Text style={pdfStyles.docTitle}>{titulo.toUpperCase()}</Text>
        <Text style={pdfStyles.docDate}>
          {new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(new Date())}
        </Text>
      </View>
    </View>
  );
}