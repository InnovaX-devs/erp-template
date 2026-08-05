type CalcularCostoPromedioPonderadoParams = {
  stockActual: number;
  costoActual: number;
  cantidadNueva: number;
  costoNuevo: number;
};

export function calcularCostoPromedioPonderado({
  stockActual,
  costoActual,
  cantidadNueva,
  costoNuevo,
}: CalcularCostoPromedioPonderadoParams): number {
  const stockTotal = stockActual + cantidadNueva;

  if (stockTotal === 0) return costoNuevo;

  const costoTotal = stockActual * costoActual + cantidadNueva * costoNuevo;
  return Math.floor(costoTotal / stockTotal);
}