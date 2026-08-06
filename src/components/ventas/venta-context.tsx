"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type TipoPrecio = "MINORISTA" | "MAYORISTA";

type VentaContextValue = {
  tipoPrecio: TipoPrecio;
  setTipoPrecio: (tipo: TipoPrecio) => void;
};

const VentaContext = createContext<VentaContextValue | null>(null);

export function VentaProvider({ children }: { children: ReactNode }) {
  const [tipoPrecio, setTipoPrecio] = useState<TipoPrecio>("MINORISTA");

  return (
    <VentaContext.Provider value={{ tipoPrecio, setTipoPrecio }}>
      {children}
    </VentaContext.Provider>
  );
}

export function useVenta() {
  const ctx = useContext(VentaContext);
  if (!ctx) throw new Error("useVenta debe usarse dentro de VentaProvider");
  return ctx;
}