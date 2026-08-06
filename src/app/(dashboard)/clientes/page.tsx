import Link from "next/link";
import { getClientesData } from "@/lib/clientes";
import ClientesFilters from "./ClientesFilters";
import ClientesTable from "./ClientesTable";
import ResumenCards from "./ResumenCards";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string }>;
}) {
  const params = await searchParams;

  const { clientes, resumen } = await getClientesData({
    busqueda: params.q,
    tipo: params.tipo as "mayorista" | "minorista" | undefined,
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#191c1e]">Clientes</h1>
        <Link
          href="/clientes/nuevo"
          className="px-4 py-2 text-sm rounded-lg bg-[#021541] text-white hover:opacity-90"
        >
          + Nuevo cliente
        </Link>
      </div>
      <ResumenCards resumen={resumen} />
      <ClientesFilters />
      <ClientesTable clientes={clientes} />
    </div>
  );
}