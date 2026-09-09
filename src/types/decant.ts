export type Presentacion = "FRASCO" | "DECANT_5ML" | "DECANT_10ML";

export type OpcionPresentacion = {
  presentacion: Presentacion;
  etiqueta: string;
  precio: number; // ARS
  disponible: boolean;
  motivoNoDisponible?: string;
};