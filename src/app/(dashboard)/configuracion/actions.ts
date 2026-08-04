"use server";

import { put } from "@vercel/blob";
import { actualizarConfiguracion } from "@/lib/configuracion";
import { revalidatePath } from "next/cache";

export async function guardarConfiguracion(formData: FormData) {
  const nombreNegocio = formData.get("nombreNegocio") as string;
  const telefono = formData.get("telefono") as string;
  const email = formData.get("email") as string;
  const direccion = formData.get("direccion") as string;
  const remitenteNombre = formData.get("remitenteNombre") as string;
  const remitenteDni = formData.get("remitenteDni") as string;
  const logoFile = formData.get("logo") as File | null;

  const cotizacionUSDRaw = formData.get("cotizacionUSD") as string;
  const cotizacionUSD = Number(cotizacionUSDRaw);

  if (!cotizacionUSDRaw || Number.isNaN(cotizacionUSD) || cotizacionUSD <= 0) {
    throw new Error("Cotización USD inválida");
  }

  let logoUrl: string | undefined;

  if (logoFile && logoFile.size > 0) {
    const blob = await put(`logos/${Date.now()}-${logoFile.name}`, logoFile, {
      access: "public",
    });
    logoUrl = blob.url;
  }

  await actualizarConfiguracion({
    nombreNegocio,
    telefono,
    email,
    direccion,
    remitenteNombre,
    remitenteDni,
    cotizacionUSD,
    ...(logoUrl ? { logoUrl } : {}),
  });

  revalidatePath("/", "layout");
}