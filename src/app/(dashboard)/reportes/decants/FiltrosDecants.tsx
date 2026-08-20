"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Select from "@/components/ui/select";
import type { FiltrosReporteDecants } from "./queries";

const ESTADOS: { value: "TODOS" | "PAGADA" | "A_CUENTA" | "ANULADA"; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "PAGADA", label: "Pagadas" },
  { value: "A_CUENTA", label: "A cuenta" },
  { value: "ANULADA", label: "Anuladas" },
];

export function FiltrosDecants({
  filtrosActuales,
}: {
  filtrosActuales: FiltrosReporteDecants;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(filtrosActuales.query ?? "");

  function actualizarParam(clave: string, valor: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(clave, valor);
    } else {
      params.delete(clave);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  // Debounce del buscador de texto libre (400ms) para no disparar una
  // navegación por cada tecla.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query !== (filtrosActuales.query ?? "")) {
        actualizarParam("q", query.trim() || undefined);
      }
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex w-full flex-col gap-1 sm:w-auto">
        <label className="text-xs font-semibold uppercase tracking-wide text-text-dim">
          Cliente o producto
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="w-full min-w-0 rounded-md border border-border bg-white px-3 py-2 text-sm text-text"
        />
      </div>

      <div className="flex w-full flex-col gap-1 sm:w-auto">
        <label className="text-xs font-semibold uppercase tracking-wide text-text-dim">
          Estado
        </label>
        <Select
          value={filtrosActuales.estado ?? "TODOS"}
          onChange={(value) => actualizarParam("estado", value === "TODOS" ? undefined : value)}
          options={ESTADOS}
          className="w-full sm:w-40"
        />
      </div>

      <div className="flex w-full flex-col gap-1 sm:w-auto">
        <label className="text-xs font-semibold uppercase tracking-wide text-text-dim">
          Desde
        </label>
        <input
          type="date"
          defaultValue={filtrosActuales.desde ?? ""}
          onChange={(e) => actualizarParam("desde", e.target.value || undefined)}
          className="w-full min-w-0 rounded-md border border-border bg-white px-3 py-2 text-sm text-text"
        />
      </div>

      <div className="flex w-full flex-col gap-1 sm:w-auto">
        <label className="text-xs font-semibold uppercase tracking-wide text-text-dim">
          Hasta
        </label>
        <input
          type="date"
          defaultValue={filtrosActuales.hasta ?? ""}
          onChange={(e) => actualizarParam("hasta", e.target.value || undefined)}
          className="w-full min-w-0 rounded-md border border-border bg-white px-3 py-2 text-sm text-text"
        />
      </div>
    </div>
  );
}