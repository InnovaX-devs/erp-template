"use server";

import { actualizarConfiguracion } from "@/lib/configuracion";
import { revalidatePath } from "next/cache";

export async function guardarFormulaDecant(formData: FormData) {
  const costoEnvaseDecantARS = Number(formData.get("costoEnvaseDecantARS"));
  const multiplicadorInsumoDecant = Number(
    formData.get("multiplicadorInsumoDecant")
  );

  if (!Number.isFinite(costoEnvaseDecantARS) || costoEnvaseDecantARS < 0) {
    throw new Error(
      "El costo del envase debe ser un número válido mayor o igual a 0"
    );
  }

  if (!Number.isFinite(multiplicadorInsumoDecant) || multiplicadorInsumoDecant <= 0) {
    throw new Error("El multiplicador debe ser un número válido mayor a 0");
  }

  await actualizarConfiguracion({
    costoEnvaseDecantARS,
    multiplicadorInsumoDecant,
  });

  revalidatePath("/", "layout");
  revalidatePath("/productos");
}