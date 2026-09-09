"use client";

import { useState, useTransition } from "react";
import ClienteForm, { type ClienteBasico } from "@/components/clientes/ClienteForm";
import { buscarClientes } from "@/app/(dashboard)/presupuestos/actions";
import type { ClienteBusqueda } from "@/types/presupuesto";

export default function BuscadorCliente({
  clienteSeleccionado,
  onSeleccionar,
}: {
  clienteSeleccionado: ClienteBasico | null;
  onSeleccionar: (cliente: ClienteBasico | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ClienteBusqueda[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    setQuery(value);
    setAbierto(true);
    startTransition(async () => {
      const res = await buscarClientes(value);
      setResultados(res);
    });
  }

  function handleSeleccionar(cliente: ClienteBusqueda) {
    onSeleccionar(cliente as ClienteBasico);
    setQuery("");
    setResultados([]);
    setAbierto(false);
  }

  return (
    <div className="flex gap-2">
      <div className="relative w-64">
        <input
          type="text"
          value={clienteSeleccionado ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido ?? ""}` : query}
          onChange={(e) => {
            if (clienteSeleccionado) onSeleccionar(null);
            handleChange(e.target.value);
          }}
          onFocus={() => setAbierto(true)}
          placeholder="Buscar cliente (opcional)..."
          className="w-full px-3 py-2.5 border border-[#c5c6d0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#021541]"
        />
        {abierto && query.trim() && !clienteSeleccionado && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-[#c5c6d0] rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {isPending && <p className="px-3 py-2 text-sm text-[#45464f]">Buscando...</p>}
            {!isPending && resultados.length === 0 && (
              <p className="px-3 py-2 text-sm text-[#45464f]">Sin resultados.</p>
            )}
            {!isPending &&
              resultados.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSeleccionar(c)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[#f1f5f9]"
                >
                  {c.nombre} {c.apellido ?? ""}
                  {c.esMayorista && <span className="ml-2 text-[11px] text-[#735c00]">mayorista</span>}
                </button>
              ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setMostrarModal(true)}
        className="w-10 h-10 flex items-center justify-center border border-[#c5c6d0] rounded-lg text-[#021541] hover:bg-[#f1f5f9]"
        aria-label="Nuevo cliente"
      >
        +
      </button>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-[#191c1e]">Nuevo cliente</h3>
            <ClienteForm
              onSuccess={(cliente) => {
                onSeleccionar(cliente);
                setMostrarModal(false);
              }}
              onCancel={() => setMostrarModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}