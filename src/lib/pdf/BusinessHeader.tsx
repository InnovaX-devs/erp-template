import { View, Text, Image } from "@react-pdf/renderer";
import { pdfStyles } from "./styles";
import type { Configuracion } from "@prisma/client";

export function BusinessHeader({
  configuracion,
  titulo,
}: {
  configuracion: Configuracion | null;
  titulo: string;
}) {
  return (
    <View style={pdfStyles.header} fixed>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {configuracion?.logoUrl && (
          <Image src={configuracion.logoUrl} style={[pdfStyles.logo, { marginRight: 10 }]} />
        )}
        <View>
          <Text style={pdfStyles.businessName}>
            {configuracion?.nombreNegocio ?? "Mi Negocio"}
          </Text>
          {configuracion?.direccion && (
            <Text style={pdfStyles.businessDetail}>{configuracion.direccion}</Text>
          )}
          {(configuracion?.telefono || configuracion?.email) && (
            <Text style={pdfStyles.businessDetail}>
              {[configuracion?.telefono, configuracion?.email].filter(Boolean).join("  ·  ")}
            </Text>
          )}
        </View>
      </View>
      <View>
        <Text style={pdfStyles.docTitle}>{titulo}</Text>
        <Text style={pdfStyles.docTitle}>
          {new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date())}
        </Text>
      </View>
    </View>
  );
}