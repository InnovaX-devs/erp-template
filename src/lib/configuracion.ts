import { prisma } from "@/lib/prisma";

const CONFIGURACION_ID = "singleton";

export async function obtenerConfiguracion() {
  const configuracion = await prisma.configuracion.findUnique({
    where: { id: CONFIGURACION_ID },
  });

  if (configuracion) {
    return configuracion;
  }

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
    logoUrl: string | null;
    telefono: string;
    email: string;
    direccion: string;
    instagram: string;
    remitenteNombre: string;
    remitenteDni: string;
    colorPrimario: string;
    colorSecundario: string;
    cotizacionUSD: number;
    costoPromedioPonderado: boolean;
    ventaPorDecant: boolean;
    costoEnvaseDecantARS: number;
    multiplicadorInsumoDecant: number;
    divisorFrascoDecant: number;
    offsetDecant5mlARS: number;
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