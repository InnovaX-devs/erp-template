import type { EstadoPago } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { obtenerReporteDecants, type FiltrosReporteDecants } from "./queries";
import { obtenerConfiguracion } from "@/lib/configuracion";
import { KpiCardsDecants } from "../../../../components/reportes/decants/KpiCards";
import { FiltrosDecants } from "@/components/reportes/decants/FiltrosDecants";
import { TablaVentasDecants } from "@/components/reportes/decants/TablaVentasDecants";

type SearchParams = {
  estado?: string;
  desde?: string;
  hasta?: string;
  q?: string;
};

export default async function ReporteDecantsPage({
  searchParams,
}: {
  // Next.js 16: searchParams es una Promise, hay que await-earla.
  searchParams: Promise<SearchParams>;
}) {
  const configuracion = await obtenerConfiguracion();
  if (!configuracion.ventaPorDecant) {
    redirect("/reportes");
  }

  const params = await searchParams;

  const filtros: FiltrosReporteDecants = {
    estado: (params.estado as "TODOS" | EstadoPago | undefined) ?? "TODOS",
    desde: params.desde,
    hasta: params.hasta,
    query: params.q,
  };

  const { kpis, ventas } = await obtenerReporteDecants(filtros);

  return (
    <div className="space-y-4 p-4">
      <div>
        <Link
          href="/reportes"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#45464f] hover:text-[#191c1e]"
        >
          <ArrowLeft size={14} /> Volver a Reportes
        </Link>
        <h1 className="text-xl font-semibold text-[#191c1e] sm:text-2xl">Reporte de Decants</h1>
        <p className="text-sm text-[#45464f]">
          Ingresos y unidades vendidas por decant, con filtros por cliente, producto, estado y fecha.
        </p>
      </div>

      <KpiCardsDecants kpis={kpis} />

      <FiltrosDecants filtrosActuales={filtros} />

      <TablaVentasDecants ventas={ventas} />
    </div>
  );
}