import Link from "next/link";
import { obtenerPresupuestos } from "./queries";
import PresupuestosFiltros from "./PresupuestosFiltros";
import PresupuestosTable from "./PresupuestosTable";
import type { EstadoPresupuesto } from "@/lib/presupuestos";

export default async function PresupuestosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; desde?: string; hasta?: string; clienteQuery?: string }>;
}) {
  const params = await searchParams;

  const presupuestos = await obtenerPresupuestos({
    estado: (params.estado as "TODOS" | EstadoPresupuesto) ?? "TODOS",
    desde: params.desde,
    hasta: params.hasta,
    clienteQuery: params.clienteQuery,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-[#191c1e]">Presupuestos</h1>
        <Link href="/presupuestos/nuevo" className="px-4 py-2 rounded-lg bg-[#021541] text-white text-sm">
          + Nuevo Presupuesto
        </Link>
      </div>

      <PresupuestosFiltros />

      <div className="flex-1 bg-white rounded-2xl m-4 border border-[#e2e8f0] overflow-y-auto">
        <PresupuestosTable presupuestos={presupuestos} />
      </div>
    </div>
  );
}