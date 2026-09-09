export type ModoCobro = "UNICA" | "MIXTO" | "A_CUENTA";

export type PagoLinea = {
  id: string;
  cuentaId: number | null;
  monto: number;
};

export type CuentaOption = {
  id: number;
  nombre: string;
  tipo: string;
};