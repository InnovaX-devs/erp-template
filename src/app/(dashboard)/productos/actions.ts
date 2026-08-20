"use server";

import { actualizarConfiguracion } from "@/lib/configuracion";
import { revalidatePath } from "next/cache";

export async function guardarFormulaDecant(formData: FormData) {
  const costoEnvaseDecantARS = Number(formData.get("costoEnvaseDecantARS"));
  const multiplicadorInsumoDecant = Number(
    formData.get("multiplicadorInsumoDecant")
  );
  const divisorFrascoDecant = Number(formData.get("divisorFrascoDecant"));
  const offsetDecant5mlARS = Number(formData.get("offsetDecant5mlARS"));

  if (!Number.isFinite(costoEnvaseDecantARS) || costoEnvaseDecantARS < 0) {
    throw new Error(
      "El costo del envase debe ser un número válido mayor o igual a 0"
    );
  }

  if (!Number.isFinite(multiplicadorInsumoDecant) || multiplicadorInsumoDecant <= 0) {
    throw new Error("El multiplicador debe ser un número válido mayor a 0");
  }

  if (!Number.isFinite(divisorFrascoDecant) || divisorFrascoDecant <= 0) {
    throw new Error(
      "La cantidad de decants por frasco debe ser un número válido mayor a 0"
    );
  }

  if (!Number.isFinite(offsetDecant5mlARS) || offsetDecant5mlARS < 0) {
    throw new Error(
      "El adicional del decant 5ml debe ser un número válido mayor o igual a 0"
    );
  }

  await actualizarConfiguracion({
    costoEnvaseDecantARS,
    multiplicadorInsumoDecant,
    divisorFrascoDecant,
    offsetDecant5mlARS,
  });

  revalidatePath("/", "layout");
  revalidatePath("/productos");
}