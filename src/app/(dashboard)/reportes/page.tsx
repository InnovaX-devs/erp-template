import Link from "next/link";
import { Droplets } from "lucide-react";
import { rangoParaTab, type TabReporte } from "@/lib/reportes";
import { obtenerReporte } from "./queries";
import { TabsReportes } from "./TabsReportes";
import { KpiCards } from "./components/kpi-cards";
import { DesgloseTipoPrecio } from "./components/desglose-tipo-precio";
import { DesgloseMetodoCobro } from "./components/desglose-metodo-cobro";
import { BotonExportarPdf } from "./BotonExportarPdf";

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
  const params = await searchParams;
  const tab: TabReporte = TABS_VALIDOS.includes(params.tab as TabReporte) ? (params.tab as TabReporte) : "diario";

  const rango = rangoParaTab(tab, params.desde, params.hasta);
  const faltaPeriodo = tab === "periodo" && (!params.desde || !params.hasta);

  return (
    <div className="flex flex-col gap-6 p-6 print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-2xl text-text">Reportes</h1>
          <p className="text-sm text-text-dim">
            {rango.desde.toLocaleDateString("es-AR")} — {rango.hasta.toLocaleDateString("es-AR")}
          </p>
        </div>
        <div className="flex items-center gap-2">
        <Link
          href="/reportes/decants"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-surface-hover"
        >
          <Droplets size={14} /> Reporte de Decants
        </Link>
        <BotonExportarPdf tab={tab} desde={params.desde} hasta={params.hasta} />
      </div>
      </div>

      <TabsReportes tabActual={tab} desde={params.desde} hasta={params.hasta} />

      {faltaPeriodo ? (
        <p className="text-sm text-text-dim">Elegí un rango de fechas para ver el reporte.</p>
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
    </div>
  );
}

