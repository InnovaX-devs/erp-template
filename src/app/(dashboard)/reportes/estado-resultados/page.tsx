import { rangoParaTab, esMismoDia, type TabReporte } from "@/lib/reportes";
import { obtenerReporte } from "../queries";
import { TabsReportes } from "@/components/reportes/TabsReportes";
import { formatCurrency } from "@/lib/currency";
import { formatFechaAR } from "@/lib/timezone";
import { cn } from "@/lib/cn";

type SearchParams = { tab?: string; desde?: string; hasta?: string };

const TABS_VALIDOS: TabReporte[] = ["diario", "semanal", "mensual", "periodo", "cuenta"];

export default async function EstadoResultadosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tab: TabReporte = TABS_VALIDOS.includes(params.tab as TabReporte) ? (params.tab as TabReporte) : "mensual";
  const rango = rangoParaTab(tab, params.desde, params.hasta);
  const faltaPeriodo = tab === "periodo" && (!params.desde || !params.hasta);
  const hastaVisible = new Date(rango.hasta.getTime() - 1);
  const rangoTexto = esMismoDia(rango.desde, hastaVisible)
    ? formatFechaAR(rango.desde)
    : `${formatFechaAR(rango.desde)} — ${formatFechaAR(hastaVisible)}`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#45464f]">{rangoTexto}</p>
      <TabsReportes tabActual={tab} desde={params.desde} hasta={params.hasta} />

      {faltaPeriodo ? (
        <p className="text-sm text-[#45464f]">Elegí un rango de fechas para ver el estado de resultados.</p>
      ) : (
        <EstadoResultadosSection rango={rango} />
      )}
    </div>
  );
}

async function EstadoResultadosSection({ rango }: { rango: { desde: Date; hasta: Date } }) {
  const { kpis } = await obtenerReporte(rango);
  const gananciaBrutaARS = kpis.ingresosARS - kpis.costoVentaARS;

  const filas = [
    { label: "Ingresos por ventas (cobrado)", valor: kpis.ingresosARS, tono: "normal" as const },
    { label: "Costo de mercadería vendida", valor: -kpis.costoVentaARS, tono: "resta" as const },
    { label: "Ganancia bruta", valor: gananciaBrutaARS, tono: "subtotal" as const },
    { label: "Gastos operativos", valor: -kpis.egresosARS, tono: "resta" as const },
    { label: "Ganancia neta", valor: kpis.gananciaNetaARS, tono: "total" as const },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="border-b border-[#E2E8F0] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#191c1e]">Estado de Resultados</h2>
        <p className="text-xs text-[#45464f]">
          Ingresos por lo efectivamente cobrado en el período (no lo facturado). Margen neto: {kpis.margenPorcentaje.toFixed(1)}%
        </p>
      </div>
      <div className="divide-y divide-[#E2E8F0]">
        {filas.map((f) => (
          <div
            key={f.label}
            className={cn(
              "flex items-center justify-between px-4 py-3",
              f.tono === "subtotal" && "bg-[#F8FAFC]",
              f.tono === "total" && "bg-[#F0FDF4]"
            )}
          >
            <span
              className={cn(
                "text-sm",
                f.tono === "normal" && "text-[#45464f]",
                f.tono === "resta" && "pl-4 text-[#45464f]",
                f.tono === "subtotal" && "font-medium text-[#191c1e]",
                f.tono === "total" && "font-semibold text-[#191c1e]"
              )}
            >
              {f.label}
            </span>
            <span
              className={cn(
                "text-sm",
                f.tono === "normal" && "text-[#191c1e]",
                f.tono === "resta" && "text-[#ba1a1a]",
                f.tono === "subtotal" && "font-medium text-[#191c1e]",
                f.tono === "total" && "text-lg font-bold text-[#1e7d38]"
              )}
            >
              {f.valor < 0 ? "-" : ""}
              {formatCurrency(Math.abs(f.valor), "ARS")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
