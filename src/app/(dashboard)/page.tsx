import { cn } from "@/lib/cn";

export default function DashboardPage() {
  const stats = [
    { label: "Ventas del día", value: "$4.250,00", sub: "+12.5% vs ayer", subColor: "text-success" },
    { label: "Pedidos pendientes", value: "18", sub: "Por despachar hoy", subColor: "text-text-dim" },
    { label: "Stock bajo", value: "7", sub: "SKUs requieren reposición", subColor: "text-danger" },
    { label: "Clientes nuevos", value: "12", sub: "+4 este mes", subColor: "text-success" },
  ];

  const cuentas = [
    { label: "Belo egreso", value: "$1.866.641,48" },
    { label: "Cuentas ext.", value: "$2.805.682,35" },
    { label: "Efectivo", value: "$5.063.462,39" },
    { label: "Mercado Pago", value: "$4.853.336,68" },
    { label: "Naranja X", value: "$12.707.162,25" },
  ];

  const ultimosIngresos = [
    { producto: "Oud Wood Intense", detalle: "Tom Ford · 100ml", cantidad: "+24 Stock" },
    { producto: "Baccarat Rouge 540", detalle: "MFK · 70ml", cantidad: "+12 Stock" },
  ];

  const ventasRecientes = [
    { id: "#TRX-8982", cliente: "Boutique Aromas S.A.", fecha: "12 Oct 2023", monto: "$1,250.00", estado: "Completado" },
    { id: "#TRX-8981", cliente: "Perfumería El Sol", fecha: "12 Oct 2023", monto: "$890.50", estado: "Procesando" },
    { id: "#TRX-8980", cliente: "Cliente Final (Web)", fecha: "11 Oct 2023", monto: "$345.00", estado: "Completado" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">
            Panorama General
          </h1>
          <p className="text-sm text-text-dim">Resumen de actividad de hoy</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
          + Nueva Venta
        </button>
      </div>

      {/* Saldo total */}
      <div className="rounded-2xl bg-ink p-6 text-ivory">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-ivory/50">
            Saldo Total
          </p>
          <button className="rounded-lg bg-white/10 p-2 hover:bg-white/15">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
        <p className="mt-1 font-display text-3xl font-semibold">
          $29.764.026,94
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 sm:grid-cols-5">
          {cuentas.map((c) => (
            <div key={c.label}>
              <p className="text-[11px] uppercase tracking-wide text-ivory/40">
                {c.label}
              </p>
              <p className="text-sm font-medium text-amber">{c.value}</p>
            </div>
          ))}
        </div>

        <button className="mt-4 text-xs font-medium text-amber hover:underline">
          Ver todas (7) →
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <p className="text-xs uppercase tracking-wide text-text-dim">
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-text">{s.value}</p>
            <p className={`mt-1 text-xs ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Ventas recientes */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium text-text">Ventas Recientes</h2>
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-dim hover:bg-surface-hover">
            Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="pb-2 pr-4 font-medium">ID Venta</th>
                <th className="pb-2 pr-4 font-medium">Cliente</th>
                <th className="pb-2 pr-4 font-medium">Fecha</th>
                <th className="pb-2 pr-4 font-medium">Monto</th>
                <th className="pb-2 pr-4 font-medium">Estado</th>
                <th className="pb-2 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {ventasRecientes.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium text-primary">{v.id}</td>
                  <td className="py-3 pr-4 text-text">{v.cliente}</td>
                  <td className="py-3 pr-4 text-text-dim">{v.fecha}</td>
                  <td className="py-3 pr-4 font-medium text-text">{v.monto}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        v.estado === "Completado"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {v.estado}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="text-text-dim hover:text-text">⋮</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart + últimos ingresos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-text">
              Rendimiento de Ventas Mensual
            </h2>
            <select className="rounded-lg border border-border bg-surface px-2 py-1 text-sm text-text">
              <option>Este Mes</option>
            </select>
          </div>
          <div className="flex h-64 items-center justify-center text-sm text-text-dim">
            {/* Gráfico real (recharts) cuando conectemos datos de Ventas */}
            Gráfico próximamente
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-text">Últimos Ingresos</h2>
            <button className="text-xs font-medium text-primary hover:underline">
              Ver Todo
            </button>
          </div>
          <div className="space-y-4 text-sm">
            {ultimosIngresos.map((item) => (
              <div key={item.producto} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text">{item.producto}</p>
                  <p className="text-xs text-text-dim">{item.detalle}</p>
                </div>
                <span className="text-xs font-medium text-success">
                  {item.cantidad}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}