import { NextResponse } from "next/server";
import { obtenerConfiguracion } from "@/lib/configuracion";

export async function GET() {
  try {
    const config = await obtenerConfiguracion();
    return NextResponse.json({
      cotizacionUSD: config.cotizacionUSD,
      costoEnvaseDecantARS: config.costoEnvaseDecantARS ?? 0,
      multiplicadorInsumoDecant: config.multiplicadorInsumoDecant ?? 0,
      divisorFrascoDecant: config.divisorFrascoDecant ?? 9,
      offsetDecant5mlARS: config.offsetDecant5mlARS ?? 200,
    });
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return NextResponse.json({ error: "Error al obtener la configuración" }, { status: 500 });
  }
}