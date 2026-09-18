import { obtenerCuentasPorCobrar } from "./queries";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";

const COLOR_BUCKET: Record<string, string> = {
  "0-30": "text-[#1e7d38]",
  "31-60": "text-[#a15c00]",
  "61-90": "text-[#c2410c]",
  "90+": "text-[#ba1a1a]",
};

export default async function CuentasPorCobrarPage() {
  const data = await obtenerCuentasPorCobrar();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-[#45464f]">Total pendiente de cobro</p>
        <p className="mt-1 text-2xl font-semibold text-[#191c1e]">
          {formatCurrency(data.totalPendienteARS, "ARS")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {data.buckets.map((b) => (
          <div key={b.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-[#45464f]">{b.label} días</p>
            <p className={cn("mt-1 text-lg font-semibold", COLOR_BUCKET[b.label])}>
              {formatCurrency(b.totalARS, "ARS")}
            </p>
            <p className="text-xs text-[#45464f]">{b.cantidad} cliente{b.cantidad !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#191c1e]">Detalle por cliente</h2>
        </div>
        {data.clientes.length === 0 ? (
          <p className="p-6 text-center text-sm text-[#45464f]">No hay deuda de clientes pendiente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] text-[11px] uppercase tracking-wide text-[#45464f]">
                <tr className="text-left">
                  <th className="px-4 py-2">Cliente</th>
                  <th className="px-4 py-2">Teléfono</th>
                  <th className="px-4 py-2">Antigüedad</th>
                  <th className="px-4 py-2 text-right">Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {data.clientes.map((c) => (
                  <tr key={c.clienteId} className="border-t border-[#E2E8F0]">
                    <td className="px-4 py-2 font-medium text-[#191c1e]">{c.nombre}</td>
                    <td className="px-4 py-2 text-[#5b6472]">{c.telefono ?? "-"}</td>
                    <td className={cn("px-4 py-2 font-medium", COLOR_BUCKET[c.bucket])}>
                      {c.diasVencidoMax} días ({c.bucket})
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-[#191c1e]">
                      {formatCurrency(c.pendienteARS, "ARS")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
