"use client";

import { useState } from "react";
import Link from "next/link";
import type { PresupuestoListado } from "../../app/(dashboard)/presupuestos/queries";
import DetallePresupuestoModal from "@/components/presupuestos/DetallePresupuestoModal";
import { formatFechaAR } from "@/lib/timezone";

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

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        {presupuestos.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#45464f]">
            No hay presupuestos que coincidan con los filtros.
          </p>
        ) : (
          <>
            {/* Desktop / tablet: tabla */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-[#F1F5F9]">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Vence</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {presupuestos.map((p) => (
                    <tr key={p.id} className="border-t border-[#E2E8F0]">
                      <td className="px-4 py-3 font-mono text-xs text-[#45464f]">#{p.id}</td>
                      <td className="px-4 py-3 font-medium text-[#191c1e]">{p.clienteNombre ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-[#191c1e]">
                        ${p.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-[#45464f]">
                        {formatFechaAR(p.fecha)}
                      </td>
                      <td className="px-4 py-3 text-[#45464f]">
                        {formatFechaAR(p.fechaVencimiento)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_STYLES[p.estado]}`}
                        >
                          {ESTADO_LABEL[p.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setIdSeleccionado(p.id)}
                            className="text-sm text-[#021541] hover:underline"
                          >
                            Ver
                          </button>
                          {p.estado === "BORRADOR" && (
                            <Link
                              href={`/presupuestos/${p.id}/editar`}
                              className="text-sm text-[#021541] hover:underline"
                            >
                              Editar
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: tarjetas */}
            <div className="divide-y divide-[#E2E8F0] md:hidden">
              {presupuestos.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-[#45464f]">#{p.id}</p>
                      <p className="truncate font-medium text-[#191c1e]">{p.clienteNombre ?? "—"}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_STYLES[p.estado]}`}
                    >
                      {ESTADO_LABEL[p.estado]}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono font-semibold text-[#191c1e]">${p.total.toFixed(2)}</p>
                    <p className="text-xs text-[#45464f]">
                      {formatFechaAR(p.fecha)} · Vence{" "}
                      {formatFechaAR(p.fechaVencimiento)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setIdSeleccionado(p.id)}
                      className="text-sm font-medium text-[#021541]"
                    >
                      Ver
                    </button>
                    {p.estado === "BORRADOR" && (
                      <Link href={`/presupuestos/${p.id}/editar`} className="text-sm font-medium text-[#021541]">
                        Editar
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {idSeleccionado != null && (
        <DetallePresupuestoModal presupuestoId={idSeleccionado} onClose={() => setIdSeleccionado(null)} />
      )}
    </>
  );
}