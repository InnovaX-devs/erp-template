"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";

export default function ClientesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function actualizarParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleBusquedaChange(value: string) {
    setBusqueda(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => actualizarParam("q", value), 400);
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => handleBusquedaChange(e.target.value)}
        className="border border-[#c5c6d0] rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#021541]"
      />

      <select
        defaultValue={searchParams.get("tipo") ?? ""}
        onChange={(e) => actualizarParam("tipo", e.target.value)}
        className="border border-[#c5c6d0] rounded-lg px-3 py-2 text-sm"
      >
        <option value="">Todos los tipos</option>
        <option value="mayorista">Mayorista</option>
        <option value="minorista">Minorista</option>
      </select>
    </div>
  );
}