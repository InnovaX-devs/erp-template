const TZ = "America/Argentina/Buenos_Aires";

/** Formatea una fecha como hora local de Argentina, ej: "14:47". */
export function formatHoraAR(fecha: Date): string {
  return fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

/** Formatea una fecha como fecha local de Argentina, ej: "24/08/2026". */
export function formatFechaAR(fecha: Date): string {
  return fecha.toLocaleDateString("es-AR", {
    timeZone: TZ,
  });
}

/** Formatea fecha + hora completas en horario de Argentina. */
export function formatFechaHoraAR(fecha: Date): string {
  return fecha.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: TZ,
  });
}

/**
 * Devuelve la fecha YYYY-MM-DD correspondiente a Argentina.
 * Ej: "2026-08-24"
 */
export function fechaISOAR(fecha: Date = new Date()): string {
  return fecha.toLocaleDateString("en-CA", {
    timeZone: TZ,
  });
}

/**
 * Convierte una fecha YYYY-MM-DD de Argentina
 * al instante correspondiente a las 00:00 de Argentina.
 */
export function inicioDiaAR(fecha: string): Date {
  return new Date(`${fecha}T00:00:00-03:00`);
}

/**
 * Devuelve inicio y fin exclusivo del día actual en Argentina.
 */
export function inicioFinHoyAR(): { inicio: Date; fin: Date } {
  const fechaHoyAR = fechaISOAR();

  const inicio = inicioDiaAR(fechaHoyAR);

  const fin = new Date(inicio);
  fin.setUTCDate(fin.getUTCDate() + 1);

  return { inicio, fin };
}

/**
 * Obtiene la fecha YYYY-MM-DD del día siguiente.
 */
export function siguienteDiaAR(fecha: string): string {
  const date = new Date(`${fecha}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
}

/**
 * Obtiene la fecha YYYY-MM-DD del día anterior.
 */
export function anteriorDiaAR(fecha: string): string {
  const date = new Date(`${fecha}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() - 1);

  return date.toISOString().slice(0, 10);
}