
export function calcularVariacion(actual: number, anterior: number) {
  const monto = actual - anterior;
  if (anterior === 0) {
    return {
      monto,
      porcentaje: actual === 0 ? 0 : null,
      sinDatosPrevios: true,
    };
  }
  return {
    monto,
    porcentaje: (monto / anterior) * 100,
    sinDatosPrevios: false,
  };
}

export function mesAnterior(anio: number, mes: number) {
  return mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };
}

/** Rango [inicio, fin) en hora de Argentina (UTC-3) para un mes calendario (fin exclusivo). */
export function rangoDeMes(anio: number, mes: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const anioFin = mes === 12 ? anio + 1 : anio;
  const mesFin = mes === 12 ? 1 : mes + 1;
  const inicio = new Date(`${anio}-${pad(mes)}-01T00:00:00.000-03:00`);
  const fin = new Date(`${anioFin}-${pad(mesFin)}-01T00:00:00.000-03:00`);
  return { inicio, fin };
}

/** Devuelve los últimos n meses (incluyendo anioFin/mesFin), ordenados ascendente. */
export function ultimosNMeses(anioFin: number, mesFin: number, n: number) {
  const meses: { anio: number; mes: number }[] = [];
  let anio = anioFin;
  let mes = mesFin;
  for (let i = 0; i < n; i++) {
    meses.unshift({ anio, mes });
    const prev = mesAnterior(anio, mes);
    anio = prev.anio;
    mes = prev.mes;
  }
  return meses;
}

export function etiquetaMes(anio: number, mes: number) {
  return `${anio}-${String(mes).padStart(2, "0")}`;
}