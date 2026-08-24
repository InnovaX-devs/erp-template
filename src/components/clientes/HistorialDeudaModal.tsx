"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { obtenerHistorialDeuda } from "@/app/(dashboard)/clientes/actions";

type EventoHistorial = {
  id: string;
  tipo: "venta" | "pago";
  monto: number;
  fecha: string;
  label: string;
  sublabel: string;
  ventaId: number;
  saldoAntes: number;
  saldoDespues: number;
};

function formatARS(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HistorialDeudaModal({
  cliente,
  onClose,
}: {
  cliente: { id: number; nombre: string };
  onClose: () => void;
}) {
  const [eventos, setEventos] = useState<EventoHistorial[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerHistorialDeuda(cliente.id)
      .then(setEventos)
      .catch(() => setError("No se pudo cargar el historial."));
  }, [cliente.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-lg font-bold text-[#191c1e]">Historial de deuda</h2>
            <p className="text-sm text-[#8a8c94]">{cliente.nombre}</p>
          </div>
          <button onClick={onClose} className="text-[#45464f] hover:text-[#191c1e]">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {error && <p className="text-sm text-[#ba1a1a]">{error}</p>}

          {!error && eventos === null && (
            <p className="text-sm text-[#45464f] text-center py-6">Cargando...</p>
          )}

          {eventos !== null && eventos.length === 0 && (
            <p className="text-sm text-[#45464f] text-center py-6">
              Este cliente no tiene movimientos de deuda.
            </p>
          )}

          {eventos?.map((e) => (
            <div
              key={e.id}
              className={`rounded-xl px-4 py-3 ${
                e.tipo === "pago" ? "bg-[#e8f7ef]" : "bg-[#fdecec]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      e.tipo === "pago" ? "bg-[#0f9d58]" : "bg-[#ba1a1a]"
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-sm text-[#191c1e]">{e.label}</p>
                    <p className="text-xs text-[#45464f]">{e.sublabel}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold shrink-0 ${
                    e.tipo === "pago" ? "text-[#0f9d58]" : "text-[#ba1a1a]"
                  }`}
                >
                  {e.tipo === "pago" ? "−" : "+"}
                  {formatARS(Math.abs(e.monto))}
                </span>
              </div>
              <p className="text-xs text-[#8a8c94] mt-2">
                {formatFecha(e.fecha)} · Saldo: {formatARS(e.saldoAntes)} → {formatARS(e.saldoDespues)}
                {e.tipo === "venta" ? ` · Venta #${e.ventaId}` : ""}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            className="w-full rounded-full border border-[#c5c6d0] py-2.5 text-sm font-medium hover:bg-[#eceef0]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}