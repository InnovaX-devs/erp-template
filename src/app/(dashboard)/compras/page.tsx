"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { ProveedoresTab } from "@/components/proveedores/proveedores-tab";

type Tab = "compras" | "proveedores";

export default function ComprasPage() {
  // Arrancamos en "proveedores" porque es lo primero que se resuelve del
  // milestone Compras (issue #59). El tab "Compras" se completa con los
  // próximos issues: Nueva Compra, Confirmar Compra y Listado de Compras.
  const [tab, setTab] = useState<Tab>("proveedores");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 border-b border-border">
        <button
          onClick={() => setTab("compras")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "compras"
              ? "border-primary text-text"
              : "border-transparent text-text-dim hover:text-text"
          )}
        >
          Compras
        </button>
        <button
          onClick={() => setTab("proveedores")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "proveedores"
              ? "border-primary text-text"
              : "border-transparent text-text-dim hover:text-text"
          )}
        >
          Proveedores
        </button>
      </div>

      {tab === "proveedores" ? (
        <ProveedoresTab />
      ) : (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-dim">
          Listado de compras — próximamente (issues #60, #61 y #62 del milestone).
        </div>
      )}
    </div>
  );
}
