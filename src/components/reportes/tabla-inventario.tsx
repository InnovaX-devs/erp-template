"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { formatFechaAR } from "@/lib/timezone";
import type { ProductoInventarioItem } from "@/app/(dashboard)/reportes/inventario/queries";

const OPCIONES_DIAS = [30, 60, 90, 120];

export function TablaInventario({
  titulo,
  items,
  columnaExtra,
  vacio,
  filtroDias,
}: {
  titulo: string;
  items: ProductoInventarioItem[];
  columnaExtra: "stock" | "ultimaVenta";
  vacio: string;
  filtroDias?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function cambiarDias(dias: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("dias", String(dias));
    router.push(`/reportes/inventario?${params.toString()}`);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#191c1e]">{titulo}</h2>
        {filtroDias != null && (
          <div className="flex gap-1">
            {OPCIONES_DIAS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => cambiarDias(d)}
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  d === filtroDias
                    ? "bg-[#021541] text-white"
                    : "bg-[#F8FAFC] text-[#45464f] hover:bg-[#eceef0]"
                }`}
              >
                {d} días
              </button>
            ))}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="p-6 text-center text-sm text-[#45464f]">{vacio}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] uppercase tracking-wide text-[#45464f]">
              <tr className="text-left">
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2">Marca</th>
                {columnaExtra === "stock" ? (
                  <>
                    <th className="px-4 py-2">Stock actual</th>
                    <th className="px-4 py-2">Stock mínimo</th>
                  </>
                ) : (
                  <th className="px-4 py-2">Última venta</th>
                )}
                <th className="px-4 py-2 text-right">Valor stock (costo)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[#E2E8F0]">
                  <td className="px-4 py-2 font-medium text-[#191c1e]">{item.nombre}</td>
                  <td className="px-4 py-2 text-[#5b6472]">{item.marca ?? "-"}</td>
                  {columnaExtra === "stock" ? (
                    <>
                      <td className="px-4 py-2">
                        <span className={item.stockActual <= 0 ? "font-semibold text-[#ba1a1a]" : "text-[#a15c00] font-semibold"}>
                          {item.stockActual}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-[#5b6472]">{item.stockMinimo}</td>
                    </>
                  ) : (
                    <td className="px-4 py-2 text-[#5b6472]">
                      {item.ultimaVenta ? formatFechaAR(item.ultimaVenta) : "Nunca vendido"}
                    </td>
                  )}
                  <td className="px-4 py-2 text-right font-medium text-[#191c1e]">
                    {formatCurrency(item.valorStockARS, "ARS")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
