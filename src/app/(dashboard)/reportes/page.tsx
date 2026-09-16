import { rangoParaTab, esMismoDia, type TabReporte } from "@/lib/reportes";
import { obtenerReporte } from "./queries";
import { TabsReportes } from "../../../components/reportes/TabsReportes";
import { KpiCards } from "@/components/reportes/kpi-cards";
import { DesgloseTipoPrecio } from "@/components/reportes/desglose-tipo-precio";
import { DesgloseMetodoCobro } from "@/components/reportes/desglose-metodo-cobro";
import { BotonExportarPdf } from "../../../components/reportes/BotonExportarPdf";
import { IngresosPorDia } from "@/components/reportes/ingresos-por-dia";
import { TopProductos } from "@/components/reportes/top-productos";
import { formatFechaAR } from "@/lib/timezone";
import { notFound } from "next/navigation";
import { obtenerConfiguracion } from "@/lib/configuracion";

type SearchParams = {
  tab?: string;
  desde?: string;
  hasta?: string;
};

const TABS_VALIDOS: TabReporte[] = ["diario", "semanal", "mensual", "periodo", "cuenta"];

export default async function ReportesPage({
  searchParams,
}: {
  // Next.js 16: searchParams es una Promise, hay que await-earla.
  searchParams: Promise<SearchParams>;
}) {
  const configuracion = await obtenerConfiguracion();
  if (!configuracion.habilitarReportesAvanzados) notFound();

  const params = await searchParams;
  const tab: TabReporte = TABS_VALIDOS.includes(params.tab as TabReporte) ? (params.tab as TabReporte) : "diario";

  const rango = rangoParaTab(tab, params.desde, params.hasta);
  const faltaPeriodo = tab === "periodo" && (!params.desde || !params.hasta);

  const hastaVisible = new Date(rango.hasta.getTime() - 1);

  const rangoTexto = esMismoDia(rango.desde, hastaVisible)
    ? formatFechaAR(rango.desde)
    : `${formatFechaAR(rango.desde)} — ${formatFechaAR(hastaVisible)}`;

  return (
    <div className="space-y-4 p-4 print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-[#191c1e] sm:text-2xl">Reportes</h1>
          <p className="text-sm text-[#45464f]">{rangoTexto}</p>
        </div>
        <div className="flex items-center gap-2">
          <BotonExportarPdf tab={tab} desde={params.desde} hasta={params.hasta} />
        </div>
      </div>

      <TabsReportes tabActual={tab} desde={params.desde} hasta={params.hasta} />

      {faltaPeriodo ? (
        <p className="text-sm text-[#45464f]">Elegí un rango de fechas para ver el reporte.</p>
      ) : (
        <ReportePeriodoSection rango={rango} />
      )}
    </div>
  );
}

async function ReportePeriodoSection({ rango }: { rango: { desde: Date; hasta: Date } }) {
  const reporte = await obtenerReporte(rango);
  return (
    <div className="space-y-4">
      <KpiCards kpis={reporte.kpis} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DesgloseTipoPrecio items={reporte.desgloseTipoPrecio} />
        <DesgloseMetodoCobro items={reporte.desgloseMetodoCobro} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <IngresosPorDia datos={reporte.ingresosPorDia} />
        <TopProductos items={reporte.topProductos} />
      </div>
    </div>
  );
}