"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ClienteBusquedaResult } from "@/lib/clientes-busqueda";
import type { ModoCobro, PagoLinea } from "@/types/pago";

type TipoPrecio = "MINORISTA" | "MAYORISTA";

type VentaContextValue = {
  tipoPrecio: TipoPrecio;
  setTipoPrecio: (tipo: TipoPrecio) => void;
  cliente: ClienteBusquedaResult | null;
  setCliente: (cliente: ClienteBusquedaResult | null) => void;
  modoCobro: ModoCobro;
  setModoCobro: (modo: ModoCobro) => void;
  pagos: PagoLinea[];
  setPagos: (pagos: PagoLinea[]) => void;
};

const VentaContext = createContext<VentaContextValue | null>(null);

export function VentaProvider({ children }: { children: ReactNode }) {
  const [tipoPrecio, setTipoPrecio] = useState<TipoPrecio>("MINORISTA");
  const [cliente, setClienteState] = useState<ClienteBusquedaResult | null>(null);
  const [modoCobro, setModoCobro] = useState<ModoCobro>("UNICA");
  const [pagos, setPagos] = useState<PagoLinea[]>([{ id: "pago-unica", cuentaId: null, monto: 0 }]);

  // Al seleccionar (o quitar) un cliente, el tipo de precio por defecto
  // se ajusta solo: mayorista => MAYORISTA, si no => MINORISTA.
  // El usuario puede seguir cambiándolo a mano con el toggle después.
  function setCliente(nuevoCliente: ClienteBusquedaResult | null) {
    setClienteState(nuevoCliente);
    setTipoPrecio(nuevoCliente?.esMayorista ? "MAYORISTA" : "MINORISTA");
  }

  return (
    <VentaContext.Provider
      value={{ tipoPrecio, setTipoPrecio, cliente, setCliente, modoCobro, setModoCobro, pagos, setPagos }}
    >
      {children}
    </VentaContext.Provider>
  );
}

export function useVenta() {
  const ctx = useContext(VentaContext);
  if (!ctx) throw new Error("useVenta debe usarse dentro de VentaProvider");
  return ctx;
}