export const CAMPO_LABELS: Record<string, string> = {
  COSTO: "Costo",
  MINORISTA: "Venta (Minorista)",
  MAYORISTA: "Mayorista",
};

export const ORIGEN_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  ACTUALIZACION_MASIVA: "Actualización Masiva",
};

export const CAMPO_OPTIONS = Object.entries(CAMPO_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const ORIGEN_OPTIONS = Object.entries(ORIGEN_LABELS).map(([value, label]) => ({
  value,
  label,
}));