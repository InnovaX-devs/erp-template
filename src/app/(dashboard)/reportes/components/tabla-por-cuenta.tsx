import { formatCurrency } from "@/lib/currency";
import type { ReportePorCuentaItem } from "@/types/reporte";

export function TablaPorCuenta({ cuentas }: { cuentas: ReportePorCuentaItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
            <th className="px-4 py-3">Cuenta</th>
            <th className="px-4 py-3">Ingresos</th>
            <th className="px-4 py-3">Egresos</th>
            <th className="px-4 py-3">Movimientos</th>
            <th className="px-4 py-3">Saldo actual</th>
          </tr>
        </thead>
        <tbody>
          {cuentas.map((c) => {
            const moneda = c.tipoCuenta.endsWith("USD") ? "USD" : "ARS";
            return (
              <tr key={c.cuentaId} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-text">{c.cuentaNombre}</td>
                <td className="px-4 py-3 text-success">{formatCurrency(c.ingresos, moneda)}</td>
                <td className="px-4 py-3 text-danger">{formatCurrency(c.egresos, moneda)}</td>
                <td className="px-4 py-3 text-text-dim">{c.cantidadMovimientos}</td>
                <td className="px-4 py-3 font-medium text-text">{formatCurrency(c.saldoActual, moneda)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}