"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ClienteModal from "@/components/clientes/ClienteModal";
import ClientesTable from "./ClientesTable";
import ResumenCards from "./ResumenCards";
import ClientesFilters from "./ClientesFilters";
import type { ClienteConDeuda } from "@/lib/clientes";
import type { ClienteBasico } from "@/components/clientes/ClienteForm";
import type { CuentaOption } from "./CobrarDeudaModal";

export default function ClientesContent({
  clientes,
  resumen,
  cuentas,
  umbralAlDia,
}: {
  clientes: ClienteConDeuda[];
  resumen: { totalClientes: number; totalMayoristas: number; deudaTotal: number };
  cuentas: CuentaOption[];
  umbralAlDia: number;
}) {
  const router = useRouter();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<ClienteConDeuda | null>(null);

  function abrirNuevo() {
    setClienteEditar(null);
    setModalAbierto(true);
  }

  function abrirEditar(cliente: ClienteConDeuda) {
    setClienteEditar(cliente);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setClienteEditar(null);
  }

  function handleSaved(_cliente: ClienteBasico) {
    cerrarModal();
    router.refresh(); // vuelve a pedir los datos al server component
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#191c1e]">Clientes</h1>
        <button
          onClick={abrirNuevo}
          className="px-4 py-2 text-sm rounded-lg bg-[#021541] text-white hover:opacity-90"
        >
          + Nuevo cliente
        </button>
      </div>

      <ResumenCards resumen={resumen} />
      <ClientesFilters />
      <ClientesTable
        clientes={clientes}
        cuentas={cuentas}
        umbralAlDia={umbralAlDia}
        onEditar={abrirEditar}
      />

      {modalAbierto && (
        <ClienteModal
          clienteInicial={
            clienteEditar
              ? {
                  id: clienteEditar.id,
                  nombre: clienteEditar.nombre,
                  apellido: clienteEditar.apellido ?? "",
                  telefono: clienteEditar.telefono ?? "",
                  email: clienteEditar.email ?? "",
                  direccion: clienteEditar.direccion ?? "",
                  localidad: clienteEditar.localidad ?? "",
                  esMayorista: clienteEditar.esMayorista,
                }
              : null
          }
          onSaved={handleSaved}
          onClose={cerrarModal}
        />
      )}
    </div>
  );
}