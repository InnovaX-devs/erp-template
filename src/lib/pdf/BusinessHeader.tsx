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
  const detalle = [INSTAGRAM_HANDLE, configuracion.telefono].filter(Boolean).join("  ·  ");

  return (
    <View style={pdfStyles.header} fixed>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {configuracion.logoUrl && (
          <Image src={configuracion.logoUrl} style={[pdfStyles.logo, { marginRight: 10 }]} />
        )}
        <View>
          <Text style={pdfStyles.businessName}>{configuracion.nombreNegocio}</Text>
          {detalle && <Text style={pdfStyles.businessDetail}>{detalle}</Text>}
        </View>
      </View>
      <View>
        <Text style={pdfStyles.docTitle}>{titulo.toUpperCase()}</Text>
        <Text style={[pdfStyles.docTitle, { marginTop: 2, color: "#8B93A3", fontSize: 8 }]}>
          {new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(new Date())}
        </Text>
      </View>
    </View>
  );
}