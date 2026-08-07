export function calcularFechaVencimiento(fecha: Date, vigenciaDias: number): Date {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + vigenciaDias);
  return resultado;
}

export type ItemParaTotal = {
  cantidad: number;
  precioUnitario: number;
};

export function calcularTotalPresupuesto(
  items: ItemParaTotal[],
  descuentoMonto: number | null,
  descuentoPorcentaje: number | null
): number {
  const subtotal = items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);

  let total = subtotal;
  if (descuentoPorcentaje) {
    total = total - total * (descuentoPorcentaje / 100);
  } else if (descuentoMonto) {
    total = total - descuentoMonto;
  }

  return Math.max(0, Number(total.toFixed(2)));
}

export type EstadoPresupuesto = "BORRADOR" | "VENCIDO" | "CONVERTIDO";

export function calcularEstadoEfectivo(
  estadoGuardado: EstadoPresupuesto,
  fechaVencimiento: Date,
  ahora: Date = new Date()
): EstadoPresupuesto {
  if (estadoGuardado === "CONVERTIDO") return "CONVERTIDO";
  if (estadoGuardado === "BORRADOR" && fechaVencimiento < ahora) return "VENCIDO";
  return estadoGuardado;
}