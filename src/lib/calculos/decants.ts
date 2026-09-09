export interface CalculoDecantInput {
  costoFrascoUSD: number;
  cotizacionUSD: number;
  costoEnvaseDecantARS: number;
  multiplicadorInsumoDecant: number;
  divisorFrascoDecant: number;
  offsetDecant5mlARS: number;
}

export interface CalculoDecantResult {
  costoFrascoARS: number;
  decant10ml: number;
  decant5ml: number;
}

function redondearA100(valor: number): number {
  return Math.round(valor / 100) * 100;
}

/**
 * Fórmula real del cliente (confirmada en demo):
 * costoFrascoARS = costoFrascoUSD × cotizacionUSD
 * decant10 = redondear100((costoFrascoARS × multiplicador) / divisorFrasco + costoEnvase)
 * decant5  = redondear100(decant10 / 2 + offsetDecant5ml)
 *
 * El "/divisorFrasco" reemplaza al viejo prorrateo por ml: el cliente calcula
 * la cantidad de decants de 10ml que rinde un frasco completo (aprox 9), no
 * un costo por mililitro. Por eso ya NO depende de producto.contenidoMl.
 */
export function calcularPreciosDecant(
  input: CalculoDecantInput
): CalculoDecantResult {
  const {
    costoFrascoUSD,
    cotizacionUSD,
    costoEnvaseDecantARS,
    multiplicadorInsumoDecant,
    divisorFrascoDecant,
    offsetDecant5mlARS,
  } = input;

  if (divisorFrascoDecant <= 0) {
    throw new Error("El divisor del frasco debe ser mayor a 0");
  }

  const costoFrascoARS = costoFrascoUSD * cotizacionUSD;

  const decant10ml = redondearA100(
    (costoFrascoARS * multiplicadorInsumoDecant) / divisorFrascoDecant +
      costoEnvaseDecantARS
  );

  const decant5ml = redondearA100(decant10ml / 2 + offsetDecant5mlARS);

  return { costoFrascoARS, decant10ml, decant5ml };
}