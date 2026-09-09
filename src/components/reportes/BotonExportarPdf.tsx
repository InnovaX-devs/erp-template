"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";

export function BotonExportarPdf({
  tab,
  desde,
  hasta,
}: {
  tab: string;
  desde?: string;
  hasta?: string;
}) {
  const [cargando, setCargando] = useState(false);

  async function exportar() {
    setCargando(true);
    try {
      const params = new URLSearchParams({ tab });
      if (desde) params.set("desde", desde);
      if (hasta) params.set("hasta", hasta);

      const res = await fetch(`/api/reportes/pdf?${params.toString()}`);
      if (!res.ok) throw new Error("No se pudo generar el PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-${tab}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={exportar}
      disabled={cargando}
      className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-surface-hover disabled:opacity-50"
    >
      <FileDown size={14} /> {cargando ? "Generando…" : "Exportar PDF"}
    </button>
  );
}