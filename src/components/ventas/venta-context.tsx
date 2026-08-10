"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ClienteBusquedaResult } from "@/lib/clientes-busqueda";

type TipoPrecio = "MINORISTA" | "MAYORISTA";

type VentaContextValue = {
  tipoPrecio: TipoPrecio;
  setTipoPrecio: (tipo: TipoPrecio) => void;
  cliente: ClienteBusquedaResult | null;
  setCliente: (cliente: ClienteBusquedaResult | null) => void;
};

const VentaContext = createContext<VentaContextValue | null>(null);

export function VentaProvider({ children }: { children: ReactNode }) {
  const [tipoPrecio, setTipoPrecio] = useState<TipoPrecio>("MINORISTA");
  const [cliente, setCliente] = useState<ClienteBusquedaResult | null>(null);

  return (
    <VentaContext.Provider value={{ tipoPrecio, setTipoPrecio, cliente, setCliente }}>
      {children}
    </VentaContext.Provider>
  );
}

export function useVenta() {
  const ctx = useContext(VentaContext);
  if (!ctx) throw new Error("useVenta debe usarse dentro de VentaProvider");
  return ctx;
}