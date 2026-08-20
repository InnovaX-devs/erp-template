import { calcularPreciosDecant } from "@/lib/calculos/decants";
import type { Producto, Configuracion } from "@prisma/client";

type ProductoParaDecant = Pick<
  Producto,
  "precioCosto" | "monedaPrecio" | "overrideDecant5ml" | "overrideDecant10ml"
>;

type ConfigParaDecant = Pick<
  Configuracion,
  | "cotizacionUSD"
  | "costoEnvaseDecantARS"
  | "multiplicadorInsumoDecant"
  | "divisorFrascoDecant"
  | "offsetDecant5mlARS"
>;

export type PrecioDecant = {
  precio5ml: number | null;
  precio10ml: number | null;
};

export function calcularPrecioDecant(
  producto: ProductoParaDecant,
  configuracion: ConfigParaDecant
): PrecioDecant {
  let precio5ml = producto.overrideDecant5ml;
  let precio10ml = producto.overrideDecant10ml;

  if (precio5ml !== null && precio10ml !== null) {
    return { precio5ml, precio10ml };
  }

  const {
    cotizacionUSD,
    costoEnvaseDecantARS,
    multiplicadorInsumoDecant,
    divisorFrascoDecant,
    offsetDecant5mlARS,
  } = configuracion;

  const puedeCalcular =
    costoEnvaseDecantARS !== null &&
    multiplicadorInsumoDecant !== null &&
    divisorFrascoDecant !== null &&
    offsetDecant5mlARS !== null &&
    cotizacionUSD > 0 &&
    producto.precioCosto > 0;

  if (puedeCalcular) {
    const costoFrascoUSD =
      producto.monedaPrecio === "USD"
        ? producto.precioCosto
        : producto.precioCosto / cotizacionUSD;

    try {
      const resultado = calcularPreciosDecant({
        costoFrascoUSD,
        cotizacionUSD,
        costoEnvaseDecantARS: costoEnvaseDecantARS as number,
        multiplicadorInsumoDecant: multiplicadorInsumoDecant as number,
        divisorFrascoDecant: divisorFrascoDecant as number,
        offsetDecant5mlARS: offsetDecant5mlARS as number,
      });

      if (precio5ml === null) precio5ml = resultado.decant5ml;
      if (precio10ml === null) precio10ml = resultado.decant10ml;
    } catch {
      // divisorFrascoDecant inválido u otro dato faltante: queda null ("N/D")
    }
  }

  return { precio5ml, precio10ml };
}