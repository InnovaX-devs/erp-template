"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { ProveedoresTab } from "@/components/proveedores/proveedores-tab";
import { ComprasListado } from "@/components/compras/compras-listado";

type Tab = "compras" | "proveedores";

export default function ComprasPage() {
  const [tab, setTab] = useState<Tab>("compras");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab("compras")}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === "compras"
                ? "border-primary text-text"
                : "border-transparent text-text-dim hover:text-text cursor-pointer"
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
                : "border-transparent text-text-dim hover:text-text cursor-pointer"
            )}
          >
            Proveedores
          </button>
        </div>
      </div>

      {tab === "proveedores" ? (
        <ProveedoresTab />
      ) : (
        <ComprasListado />
      )}
    </div>
  );
}