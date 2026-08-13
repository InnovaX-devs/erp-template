"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_ITEMS, esGrupo } from "@/lib/nav-items";
import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSidebar } from "@/components/layout/sidebar-context";

function useSectionTitle() {
  const pathname = usePathname();
  for (const item of NAV_ITEMS) {
    if (esGrupo(item)) {
      const child = item.children.find((c) => pathname === c.href || pathname?.startsWith(`${c.href}/`));
      if (child) return child.label;
    } else if (pathname === item.href || pathname?.startsWith(`${item.href}/`)) {
      return item.label;
    }
  }
  return "Panel";
}

export function Topbar({ cotizacionUSD }: { cotizacionUSD: number }) {
  const title = useSectionTitle();
  const { toggle } = useSidebar();
  const cotizacionFormateada = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
  }).format(cotizacionUSD);

  return (
    <header className="flex items-center justify-between gap-2 border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text hover:bg-surface-hover md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="truncate font-display text-base font-semibold text-text sm:text-lg">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <div className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 sm:flex">
          <span className="text-xs text-text/60">USD</span>
          <span className="font-mono text-sm font-medium text-text">${cotizacionFormateada}</span>
        </div>
        <ThemeToggle />
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1.5 sm:gap-2.5 sm:pr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-mono text-xs font-medium text-white">
            AD
          </span>
          {/* TODO: reemplazar "Admin" por el nombre real de la sesión activa */}
          <span className="hidden text-sm text-text/90 sm:inline">Admin</span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}