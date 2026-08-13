"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { TabReporte } from "@/lib/reportes";

const TABS: { value: TabReporte; label: string }[] = [
  { value: "diario", label: "Diario" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "periodo", label: "Período" },
  { value: "cuenta", label: "Por Cuenta" },
];

export function TabsReportes({
  tabActual,
  desde,
  hasta,
}: {
  tabActual: TabReporte;
  desde?: string;
  hasta?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function cambiarTab(tab: TabReporte) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function actualizarFecha(clave: "desde" | "hasta", valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "periodo");
    if (valor) params.set(clave, valor);
    else params.delete(clave);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 print:hidden">
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => cambiarTab(t.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tabActual === t.value ? "bg-primary text-white" : "text-text-dim hover:bg-surface-hover hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabActual === "periodo" && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-3">
          <label className="flex flex-col gap-1 text-sm text-text-dim">
            Desde
            <input
              type="date"
              defaultValue={desde ?? ""}
              onChange={(e) => actualizarFecha("desde", e.target.value)}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-text-dim">
            Hasta
            <input
              type="date"
              defaultValue={hasta ?? ""}
              onChange={(e) => actualizarFecha("hasta", e.target.value)}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm text-text"
            />
          </label>
        </div>
      )}
    </div>
  );
}