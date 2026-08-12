"use client";

import { useState } from "react";
import { eliminarCliente } from "./actions";
import DeudaCell from "./DeudaCell";
import type { ClienteConDeuda } from "@/lib/clientes";
import type { CuentaOption } from "./CobrarDeudaModal";

export default function ClientesTable({
  clientes,
  cuentas,
  umbralAlDia,
  onEditar,
}: {
  clientes: ClienteConDeuda[];
  cuentas: CuentaOption[];
  umbralAlDia: number;
  onEditar: (cliente: ClienteConDeuda) => void;
}) {
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  async function handleEliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
    setEliminandoId(id);
    const res = await eliminarCliente(id);
    setEliminandoId(null);
    if (!res.success) alert(res.error);
  }

  if (clientes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] px-4 py-8 text-center text-[#45464f] text-sm">
        No se encontraron clientes con estos filtros.
      </div>
    );
  }

  return (
    <>
      {/* Desktop: tabla */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F1F5F9]">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Deuda</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-t border-[#E2E8F0]">
                <td className="px-4 py-4 font-medium text-[#191c1e]">
                  {c.nombre} {c.apellido ?? ""}
                </td>
                <td className="px-4 py-4 text-[#45464f]">{c.telefono ?? c.email ?? "—"}</td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      c.esMayorista
                        ? "bg-[#fed65b] text-[#745c00]"
                        : "bg-[#e0e3e5] text-[#45464f]"
                    }`}
                  >
                    {c.esMayorista ? "Mayorista" : "Minorista"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <DeudaCell
                    cliente={{ id: c.id, nombre: `${c.nombre} ${c.apellido ?? ""}`.trim() }}
                    deuda={c.deuda}
                    umbralAlDia={umbralAlDia}
                    cuentas={cuentas}
                  />
                </td>
                <td className="px-4 py-4 text-right space-x-3">
                  <button
                    onClick={() => onEditar(c)}
                    className="text-[#021541] hover:underline text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(c.id, c.nombre)}
                    disabled={eliminandoId === c.id}
                    className="text-[#ba1a1a] hover:underline text-sm disabled:opacity-50"
                  >
                    {eliminandoId === c.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: tarjetas */}
      <div className="md:hidden space-y-3">
        {clientes.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-[0_4px_20px_rgba(26,43,86,0.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-[#191c1e] truncate">
                  {c.nombre} {c.apellido ?? ""}
                </p>
                <p className="text-sm text-[#45464f] truncate">{c.telefono ?? c.email ?? "—"}</p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  c.esMayorista
                    ? "bg-[#fed65b] text-[#745c00]"
                    : "bg-[#e0e3e5] text-[#45464f]"
                }`}
              >
                {c.esMayorista ? "Mayorista" : "Minorista"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
              <DeudaCell
                cliente={{ id: c.id, nombre: `${c.nombre} ${c.apellido ?? ""}`.trim() }}
                deuda={c.deuda}
                umbralAlDia={umbralAlDia}
                cuentas={cuentas}
              />
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onEditar(c)}
                  className="text-[#021541] text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(c.id, c.nombre)}
                  disabled={eliminandoId === c.id}
                  className="text-[#ba1a1a] text-sm font-medium disabled:opacity-50"
                >
                  {eliminandoId === c.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}