import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { obtenerConfiguracion } from "@/lib/configuracion";
import { DevCredit } from "@/components/shared/dev-credit";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const configuracion = await obtenerConfiguracion();

  return (
    <SidebarProvider>
      <div className="flex h-dvh overflow-hidden bg-ivory">
        <Sidebar
          logoUrl={configuracion.logoUrl ?? null}
          nombreNegocio={configuracion.nombreNegocio}
          eslogan={configuracion.eslogan}
          premium={configuracion.licencia === "PREMIUM"}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            cotizacionUSD={configuracion.cotizacionUSD}
            usaCotizacionUSD={configuracion.usaCotizacionUSD}
          />
          <main className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-border px-4 py-3 sm:px-6">
            <DevCredit />
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}