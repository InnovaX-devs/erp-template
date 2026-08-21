import type { ProveedorConCompras } from "@/lib/proveedores";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProveedoresTable({
  proveedores,
  onVerDetalle,
}: {
  proveedores: ProveedorConCompras[];
  onVerDetalle: (proveedor: ProveedorConCompras) => void;
}) {
  if (proveedores.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] px-4 py-8 text-center text-[#45464f] text-sm">
        No se encontraron proveedores que coincidan con la búsqueda.
      </div>
    );
  }

  return (
    <>
      {/* Desktop: tabla */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F1F5F9]">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3">Compras</th>
              <th className="px-4 py-3">Total comprado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr
                key={p.id}
                onClick={() => onVerDetalle(p)}
                className={`border-t border-[#E2E8F0] ${
                  p.esVirtual ? "italic text-[#45464f]" : "cursor-pointer hover:bg-[#F1F5F9]/60"
                }`}
              >
                <td className="px-4 py-4 font-medium text-[#191c1e]">{p.nombre}</td>
                <td className="px-4 py-4 text-[#45464f]">
                  {p.personaContacto || p.telefono || p.email || "—"}
                </td>
                <td className="px-4 py-4 text-[#45464f]">{p.cantidadCompras}</td>
                <td className="px-4 py-4 text-[#45464f]">{formatMoney(p.totalComprado)}</td>
                <td className="px-4 py-4 text-right">
                  {!p.esVirtual && (
                    <span className="text-[#021541] hover:underline text-sm">Ver</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: tarjetas */}
      <div className="md:hidden space-y-3">
        {proveedores.map((p) => (
          <div
            key={p.id}
            onClick={() => onVerDetalle(p)}
            className={`bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-[0_4px_20px_rgba(26,43,86,0.04)] ${
              p.esVirtual ? "italic text-[#45464f]" : "cursor-pointer"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-[#191c1e] truncate">{p.nombre}</p>
                <p className="text-sm text-[#45464f] truncate">
                  {p.personaContacto || p.telefono || p.email || "—"}
                </p>
              </div>
              {!p.esVirtual && (
                <span className="shrink-0 text-[#021541] text-sm font-medium">Ver →</span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-sm">
              <span className="text-[#45464f]">{p.cantidadCompras} compras</span>
              <span className="font-medium text-[#191c1e]">{formatMoney(p.totalComprado)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}