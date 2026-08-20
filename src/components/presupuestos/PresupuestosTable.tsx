"use client";

import { useState } from "react";
import Link from "next/link";
import type { PresupuestoListado } from "../../app/(dashboard)/presupuestos/queries";
import DetallePresupuestoModal from "@/components/presupuestos/DetallePresupuestoModal";

const ESTADO_STYLES: Record<string, string> = {
  BORRADOR: "bg-[#e0e3e5] text-[#45464f]",
  VENCIDO: "bg-[#ffdad6] text-[#93000a]",
  CONVERTIDO: "bg-[#fed65b] text-[#745c00]",
};

const ESTADO_LABEL: Record<string, string> = {
  BORRADOR: "Borrador",
  VENCIDO: "Vencido",
  CONVERTIDO: "Convertido",
};

export default function PresupuestosTable({ presupuestos }: { presupuestos: PresupuestoListado[] }) {
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);

  if (presupuestos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-[#45464f] text-sm">
        No hay presupuestos que coincidan con los filtros.
      </div>
    );
  }

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f1f5f9] text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
            <th className="text-left px-4 py-3">#</th>
            <th className="text-left px-4 py-3">Cliente</th>
            <th className="text-right px-4 py-3">Total</th>
            <th className="text-left px-4 py-3">Fecha</th>
            <th className="text-left px-4 py-3">Vence</th>
            <th className="text-left px-4 py-3">Estado</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {presupuestos.map((p) => (
            <tr key={p.id} className="border-b border-[#e2e8f0]">
              <td className="px-4 py-3 font-mono text-xs">#{p.id}</td>
              <td className="px-4 py-3">{p.clienteNombre ?? "—"}</td>
              <td className="px-4 py-3 text-right font-medium">${p.total.toFixed(2)}</td>
              <td className="px-4 py-3">{p.fecha.toLocaleDateString("es-AR")}</td>
              <td className="px-4 py-3">{p.fechaVencimiento.toLocaleDateString("es-AR")}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_STYLES[p.estado]}`}>
                  {ESTADO_LABEL[p.estado]}
                </span>
              </td>
              <td className="px-4 py-3 text-right space-x-3">
                <button
                  type="button"
                  onClick={() => setIdSeleccionado(p.id)}
                  className="text-[#021541] text-xs font-medium"
                >
                  Ver
                </button>
                {p.estado === "BORRADOR" && (
                  <Link href={`/presupuestos/${p.id}/editar`} className="text-[#021541] text-xs font-medium">
                    Editar
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {idSeleccionado != null && (
        <DetallePresupuestoModal presupuestoId={idSeleccionado} onClose={() => setIdSeleccionado(null)} />
      )}
    </>
  );
}