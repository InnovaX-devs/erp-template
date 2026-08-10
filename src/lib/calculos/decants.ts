export interface SimulacionDecantInput {
  mlPerfume: number;
  precioTotalUSD: number;
  cotizacionUSD: number;
  costoEnvaseDecantARS: number;
  multiplicadorInsumoDecant: number;
}

export interface DecantCalculado {
  ml: number;
  costoUSD: number;
  costoNetoARS: number;
  insumoARS: number; // costoNetoARS * multiplicador
  precioSugerido: number; // redondeado a $100
}

export interface SimulacionDecantResult {
  costoPorMlUSD: number;
  decant5ml: DecantCalculado;
  decant10ml: DecantCalculado;
}

function redondearA100(valor: number): number {
  return Math.round(valor / 100) * 100;
}

function calcularDecant(
  ml: number,
  costoPorMlUSD: number,
  cotizacionUSD: number,
  costoEnvaseDecantARS: number,
  multiplicadorInsumoDecant: number
): DecantCalculado {
  const costoUSD = ml * costoPorMlUSD;
  const costoNetoARS = costoUSD * cotizacionUSD;
  const insumoARS = costoNetoARS * multiplicadorInsumoDecant;
  const precioSugerido = redondearA100(insumoARS + costoEnvaseDecantARS);

  return { ml, costoUSD, costoNetoARS, insumoARS, precioSugerido };
}

/**
 * Fórmula real del cliente (audio, reemplaza al ejemplo original del issue):
 * costoPorMlUSD = precioTotalUSD / mlPerfume
 * costoNetoARS(ml) = ml × costoPorMlUSD × cotizacionUSD
 * precioSugerido(ml) = redondear100(costoNetoARS(ml) × multiplicador + costoEnvaseDecantARS)
 */
export function simularFormulaDecant(
  input: SimulacionDecantInput
): SimulacionDecantResult {
  const {
    mlPerfume,
    precioTotalUSD,
    cotizacionUSD,
    costoEnvaseDecantARS,
    multiplicadorInsumoDecant,
  } = input;

  if (mlPerfume <= 0) {
    throw new Error("Los ml del perfume deben ser mayores a 0");
  }

  const costoPorMlUSD = precioTotalUSD / mlPerfume;

  return {
    costoPorMlUSD,
    decant5ml: calcularDecant(
      5,
      costoPorMlUSD,
      cotizacionUSD,
      costoEnvaseDecantARS,
      multiplicadorInsumoDecant
    ),
    decant10ml: calcularDecant(
      10,
      costoPorMlUSD,
      cotizacionUSD,
      costoEnvaseDecantARS,
      multiplicadorInsumoDecant
    ),
  };
}