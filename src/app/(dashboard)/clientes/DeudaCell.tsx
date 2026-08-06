"use client";

import { useState } from "react";
import CobrarDeudaModal, { type CuentaOption } from "./CobrarDeudaModal";

interface DeudaCellProps {
  cliente: { id: number; nombre: string };
  deuda: number;
  umbralAlDia: number;
  cuentas: CuentaOption[];
}

export default function DeudaCell({ cliente, deuda, umbralAlDia, cuentas }: DeudaCellProps) {
  const [abierto, setAbierto] = useState(false);

  if (deuda <= umbralAlDia) {
    return <span className="text-green-600 font-medium">Al día</span>;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-red-600 font-medium">
          ${deuda.toLocaleString("es-AR")}
        </span>
        <button
          onClick={() => setAbierto(true)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
        >
          Cobrar
        </button>
      </div>

      {abierto && (
        <CobrarDeudaModal
          cliente={cliente}
          deudaTotal={deuda}
          cuentas={cuentas}
          onClose={() => setAbierto(false)}
        />
      )}
    </>
  );
}