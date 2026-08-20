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
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M15 9.5a2.5 2.5 0 0 0-2.5-2.5h-1a2 2 0 0 0 0 4h1a2 2 0 0 1 0 4h-1a2.5 2.5 0 0 1-2.5-2.5" />
          </svg>
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