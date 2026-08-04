import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { obtenerConfiguracion } from "@/lib/configuracion";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const configuracion = await obtenerConfiguracion();

  return (
    <div className="flex h-dvh overflow-hidden bg-ivory">
      <Sidebar logoUrl={configuracion.logoUrl ?? null} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar cotizacionUSD={configuracion.cotizacionUSD} />
        <main className="scrollbar-thin flex-1 overflow-y-auto px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}