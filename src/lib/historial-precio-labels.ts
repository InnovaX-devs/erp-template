export const CAMPO_LABELS: Record<string, string> = {
  COSTO: "Costo",
  MINORISTA: "Venta (Minorista)",
  MAYORISTA: "Mayorista",
  OVERRIDE_5ML: "Override Decant 5ml",
  OVERRIDE_10ML: "Override Decant 10ml",
};

export const ORIGEN_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  RECALCULO_DECANT: "Recálculo Decant",
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