import { getClientesData } from "@/lib/clientes";
import ClientesContent from "./ClientesContent";

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

  return <ClientesContent clientes={clientes} resumen={resumen} />;
}