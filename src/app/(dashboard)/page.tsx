export default function DashboardPage() {
  const stats = [
    { label: "Ventas del día", value: "$4.250,00", sub: "+12.5% vs ayer", subColor: "text-green-600" },
    { label: "Pedidos pendientes", value: "18", sub: "Por despachar hoy", subColor: "text-slate-500" },
    { label: "Stock bajo", value: "7", sub: "SKUs requieren reposición", subColor: "text-red-500" },
    { label: "Clientes nuevos", value: "12", sub: "+4 este mes", subColor: "text-green-600" },
  ];

  const cuentas = [
    { label: "Belo egreso", value: "$1.866.641,48" },
    { label: "Cuentas ext.", value: "$2.805.682,35" },
    { label: "Efectivo", value: "$5.063.462,39" },
    { label: "Mercado Pago", value: "$4.853.336,68" },
    { label: "Naranja X", value: "$12.707.162,25" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Panorama General</h1>
          <p className="text-slate-500 text-sm">Resumen de actividad de hoy</p>
        </div>
        <button className="bg-slate-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-800">
          + Nueva Venta
        </button>
      </div>

      {/* Saldo total */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        <p className="text-xs text-slate-400 uppercase tracking-wide">Saldo Total</p>
        <p className="text-3xl font-semibold mt-1">$29.764.026,94</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-4 border-t border-slate-700">
          {cuentas.map((c) => (
            <div key={c.label}>
              <p className="text-xs text-slate-400 uppercase">{c.label}</p>
              <p className="text-sm font-medium">{c.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500 uppercase">{s.label}</p>
            <p className="text-2xl font-semibold text-slate-800 mt-1">{s.value}</p>
            <p className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + últimos ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-slate-800">Rendimiento de Ventas Mensual</h2>
            <select className="text-sm border border-slate-200 rounded-lg px-2 py-1">
              <option>Este Mes</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            {/* Gráfico real (recharts) cuando conectemos datos de Ventas */}
            Gráfico próximamente
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-slate-800">Últimos Ingresos</h2>
            <button className="text-xs text-amber-600">Ver Todo</button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Oud Wood Intense</p>
                <p className="text-xs text-slate-500">Tom Ford · 100ml</p>
              </div>
              <span className="text-green-600 text-xs">+24 Stock</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Baccarat Rouge 540</p>
                <p className="text-xs text-slate-500">MFK · 70ml</p>
              </div>
              <span className="text-green-600 text-xs">+12 Stock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}