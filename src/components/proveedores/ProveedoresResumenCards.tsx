function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProveedoresResumenCards({
  resumen,
}: {
  resumen: { totalProveedores: number; totalComprado: number };
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
          Total Proveedores
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#191c1e]">{resumen.totalProveedores}</p>
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
          Total Comprado
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#191c1e]">
          {formatMoney(resumen.totalComprado)}
        </p>
      </div>
    </div>
  );
}