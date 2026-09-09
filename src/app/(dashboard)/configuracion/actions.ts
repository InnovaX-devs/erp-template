"use server";

import { put } from "@vercel/blob";
import { actualizarConfiguracion } from "@/lib/configuracion";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth"; // ⚠️ ajustar si tu ruta real es otra
import { prisma } from "@/lib/prisma";
import { isPasswordValid } from "@/lib/password-validation";

export async function guardarConfiguracion(formData: FormData) {
  const nombreNegocio = formData.get("nombreNegocio") as string;
  const telefono = formData.get("telefono") as string;
  const email = formData.get("email") as string;
  const direccion = formData.get("direccion") as string;
  const instagram = formData.get("instagram") as string;
  const remitenteNombre = formData.get("remitenteNombre") as string;
  const remitenteDni = formData.get("remitenteDni") as string;
  const colorPrimario = formData.get("colorPrimario") as string;
  const colorSecundario = formData.get("colorSecundario") as string;
  const logoFile = formData.get("logo") as File | null;
  const removerLogo = formData.get("removerLogo") === "true";

  const cotizacionUSDRaw = formData.get("cotizacionUSD") as string;
  const cotizacionUSD = Number(cotizacionUSDRaw);

  if (!cotizacionUSDRaw || Number.isNaN(cotizacionUSD) || cotizacionUSD <= 0) {
    throw new Error("Cotización USD inválida");
  }

  const costoPromedioPonderado = formData.get("costoPromedioPonderado") === "on";
  const ventaPorDecant = formData.get("ventaPorDecant") === "on";

  let logoUrl: string | null | undefined;

  if (logoFile && logoFile.size > 0) {
    const blob = await put(`logos/${Date.now()}-${logoFile.name}`, logoFile, {
      access: "public",
    });
    logoUrl = blob.url;
  } else if (removerLogo) {
    logoUrl = null;
  }

  await actualizarConfiguracion({
    nombreNegocio,
    telefono,
    email,
    direccion,
    instagram,
    remitenteNombre,
    remitenteDni,
    colorPrimario,
    colorSecundario,
    cotizacionUSD,
    costoPromedioPonderado,
    ventaPorDecant,
    ...(logoUrl !== undefined ? { logoUrl } : {}),
  });

  revalidatePath("/", "layout");
}

export async function actualizarCotizacionRapida(cotizacionUSD: number) {
  if (!cotizacionUSD || Number.isNaN(cotizacionUSD) || cotizacionUSD <= 0) {
    throw new Error("Cotización USD inválida");
  }

  await actualizarConfiguracion({ cotizacionUSD });

  revalidatePath("/", "layout");
}

export async function cambiarPassword(passwordActual: string, passwordNueva: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  if (!passwordActual || !passwordNueva) {
    throw new Error("Completá ambos campos");
  }

  if (!isPasswordValid(passwordNueva)) {
    throw new Error("La nueva contraseña no cumple con los requisitos de seguridad");
  }

  if (passwordActual === passwordNueva) {
    throw new Error("La nueva contraseña debe ser diferente a la actual");
  }

  const usuarioId = Number(session.user.id);

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  const passwordValida = await bcrypt.compare(passwordActual, usuario.passwordHash);

  if (!passwordValida) {
    throw new Error("La contraseña actual es incorrecta");
  }

  const nuevoHash = await bcrypt.hash(passwordNueva, 10);

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { passwordHash: nuevoHash },
  });
}