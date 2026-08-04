import { prisma } from "@/lib/prisma";

const CONFIGURACION_ID = "singleton";

export async function obtenerConfiguracion() {
  const configuracion = await prisma.configuracion.findUnique({
    where: { id: CONFIGURACION_ID },
  });

  if (configuracion) {
    return configuracion;
  }

  // Si todavía no existe ninguna fila, se crea una con valores por defecto
  return prisma.configuracion.create({
    data: {
      id: CONFIGURACION_ID,
      nombreNegocio: "Mi negocio",
      cotizacionUSD: 0,
    },
  });
}

export async function actualizarConfiguracion(
  data: Partial<{
    nombreNegocio: string;
    logoUrl: string;
    telefono: string;
    email: string;
    direccion: string;
    remitenteNombre: string;
    remitenteDni: string;
    cotizacionUSD: number;
    costoPromedioPonderado: boolean;
  }>
) {
  return prisma.configuracion.update({
    where: { id: CONFIGURACION_ID },
    data,
  });
}

export async function obtenerCotizacionUSD(): Promise<number> {
  const configuracion = await obtenerConfiguracion();
  return configuracion.cotizacionUSD;
}

export async function convertirUSDaARS(montoUSD: number): Promise<number> {
  const cotizacion = await obtenerCotizacionUSD();
  return montoUSD * cotizacion;
}