import { NextResponse } from "next/server";
import { obtenerCotizacionUSD } from "@/lib/configuracion";

export async function GET() {
  try {
    const cotizacionUSD = await obtenerCotizacionUSD();
    return NextResponse.json({ cotizacionUSD });
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return NextResponse.json({ error: "Error al obtener la configuración" }, { status: 500 });
  }
}