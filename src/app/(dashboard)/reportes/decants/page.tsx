import type { EstadoPago } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { obtenerReporteDecants, type FiltrosReporteDecants } from "./queries";
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
  const params = await searchParams;

  const filtros: FiltrosReporteDecants = {
    estado: (params.estado as "TODOS" | EstadoPago | undefined) ?? "TODOS",
    desde: params.desde,
    hasta: params.hasta,
    query: params.q,
  };

  const { kpis, ventas } = await obtenerReporteDecants(filtros);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <Link
          href="/reportes"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-text-dim hover:text-text"
        >
          <ArrowLeft size={14} /> Volver a Reportes
        </Link>
        <h1 className="font-display text-2xl text-text">Reporte de Decants</h1>
        <p className="text-sm text-text-dim">
          Ingresos y unidades vendidas por decant, con filtros por cliente, producto, estado y fecha.
        </p>
      </div>

      <KpiCardsDecants kpis={kpis} />

      <FiltrosDecants filtrosActuales={filtros} />

      <TablaVentasDecants ventas={ventas} />
    </div>
  );
}