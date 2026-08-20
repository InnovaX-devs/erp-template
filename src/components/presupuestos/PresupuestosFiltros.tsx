"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import DateInput from "@/components/ui/date-input";

const ESTADOS = [
  { value: "TODOS", label: "Todos" },
  { value: "BORRADOR", label: "Borrador" },
  { value: "VENCIDO", label: "Vencido" },
  { value: "CONVERTIDO", label: "Convertido" },
] as const;

export default function PresupuestosFiltros() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const estadoActual = searchParams.get("estado") ?? "TODOS";
  const [clienteQuery, setClienteQuery] = useState(searchParams.get("clienteQuery") ?? "");
  const [desde, setDesde] = useState(searchParams.get("desde") ?? "");
  const [hasta, setHasta] = useState(searchParams.get("hasta") ?? "");

  function aplicarFiltros(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    const nuevos = { estado: estadoActual, clienteQuery, desde, hasta, ...overrides };

    Object.entries(nuevos).forEach(([key, value]) => {
      if (!value || value === "TODOS") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  // Debounce del buscador de cliente para no navegar en cada tecla
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (clienteQuery !== (searchParams.get("clienteQuery") ?? "")) {
        aplicarFiltros({ clienteQuery });
      }
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteQuery]);

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-white border-b border-[#e2e8f0]">
      <div className="flex rounded-lg overflow-hidden border border-[#021541]">
        {ESTADOS.map((e) => (
          <button
            key={e.value}
            type="button"
            onClick={() => aplicarFiltros({ estado: e.value })}
            className={`px-3 py-2 text-sm font-medium ${
              estadoActual === e.value ? "bg-[#021541] text-white" : "bg-white text-[#021541]"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
          Desde
        </label>
        <DateInput
          value={desde}
          max={hasta || undefined}
          onChange={(valor) => {
            setDesde(valor);
            aplicarFiltros({ desde: valor });
          }}
          className="mt-1 border border-[#c5c6d0] rounded-lg px-2 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
          Hasta
        </label>
        <DateInput
          value={hasta}
          min={desde || undefined}
          onChange={(valor) => {
            setHasta(valor);
            aplicarFiltros({ hasta: valor });
          }}
          className="mt-1 border border-[#c5c6d0] rounded-lg px-2 py-1.5 text-sm"
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
          Cliente
        </label>
        <input
          type="text"
          value={clienteQuery}
          onChange={(e) => setClienteQuery(e.target.value)}
          placeholder="Buscar por nombre..."
          className="mt-1 w-full border border-[#c5c6d0] rounded-lg px-2 py-1.5 text-sm"
        />
      </div>

      {isPending && <span className="text-xs text-[#45464f]">Filtrando...</span>}
    </div>
  );
}