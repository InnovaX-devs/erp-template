import { simularFormulaDecant } from "@/lib/calculos/decants";
import type { Producto, Configuracion } from "@prisma/client";

type ProductoParaDecant = Pick<Producto, "precioCosto" | "monedaPrecio" | "contenidoMl" | "overrideDecant5ml" | "overrideDecant10ml">;

type ConfigParaDecant = Pick<Configuracion, "cotizacionUSD" | "costoEnvaseDecantARS" | "multiplicadorInsumoDecant">;

export type PrecioDecant = {
  precio5ml: number | null;
  precio10ml: number | null;
};

/**
 * Precio final de decant para un producto: los overrides manuales
 * siempre tienen prioridad sobre el cálculo por fórmula.
 * Si falta algún dato necesario para calcular (contenidoMl, parámetros
 * de Configuracion), devuelve null en ese campo en vez de romper.
 */
export function calcularPrecioDecant(
  producto: ProductoParaDecant,
  configuracion: ConfigParaDecant
): PrecioDecant {
  let precio5ml = producto.overrideDecant5ml;
  let precio10ml = producto.overrideDecant10ml;

  if (precio5ml !== null && precio10ml !== null) {
    return { precio5ml, precio10ml };
  }

  const { cotizacionUSD, costoEnvaseDecantARS, multiplicadorInsumoDecant } = configuracion;

  const puedeCalcular =
    producto.contenidoMl !== null &&
    producto.contenidoMl > 0 &&
    costoEnvaseDecantARS !== null &&
    multiplicadorInsumoDecant !== null &&
    cotizacionUSD > 0;

  if (puedeCalcular) {
    const precioTotalUSD =
      producto.monedaPrecio === "USD"
        ? producto.precioCosto
        : producto.precioCosto / cotizacionUSD;

    try {
      const resultado = simularFormulaDecant({
        mlPerfume: producto.contenidoMl as number,
        precioTotalUSD,
        cotizacionUSD,
        costoEnvaseDecantARS: costoEnvaseDecantARS as number,
        multiplicadorInsumoDecant: multiplicadorInsumoDecant as number,
      });

      if (precio5ml === null) precio5ml = resultado.decant5ml.precioSugerido;
      if (precio10ml === null) precio10ml = resultado.decant10ml.precioSugerido;
    } catch {
      // contenidoMl inválido u otro dato faltante: queda null (se muestra "N/D")
    }
  }

  return { precio5ml, precio10ml };
}