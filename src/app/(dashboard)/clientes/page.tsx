import { getClientesData, getCuentasActivas } from "@/lib/clientes";
import ClientesContent from "./ClientesContent";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; deuda?: string }>;
}) {
  const params = await searchParams;

  const [{ clientes, resumen, umbralAlDia }, cuentas] = await Promise.all([
    getClientesData({
      busqueda: params.q,
      tipo: params.tipo as "mayorista" | "minorista" | undefined,
      deuda: params.deuda as "con-deuda" | "al-dia" | undefined,
    }),
    getCuentasActivas(),
  ]);

  return (
    <ClientesContent
      clientes={clientes}
      resumen={resumen}
      cuentas={cuentas}
      umbralAlDia={umbralAlDia}
    />
  );
}