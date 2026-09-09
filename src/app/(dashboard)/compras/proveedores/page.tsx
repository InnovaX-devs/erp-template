import { getProveedoresData } from "@/lib/proveedores";
import ProveedoresContent from "@/components/proveedores/ProveedoresContent";

export default async function ProveedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const paginaSolicitada = Number(params.page) || 1;

  const { proveedores, resumen, paginacion } = await getProveedoresData({
    busqueda: params.q,
    pagina: paginaSolicitada,
  });

  return (
    <ProveedoresContent
      proveedores={proveedores}
      resumen={resumen}
      paginacion={paginacion}
    />
  );
}