"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

function useSectionTitle() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`)
  );
  return current?.label ?? "Panel";
}

export function Topbar() {
  const title = useSectionTitle();

  return (
    <header className="flex items-center justify-between border-b border-border bg-bg/80 px-6 py-4 backdrop-blur-xl">
      <h1 className="font-display text-lg font-semibold text-text">{title}</h1>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-surface px-2 py-1.5 pr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-mono text-xs font-medium text-white">
            AD
          </span>
          {/* TODO: reemplazar "Admin" por el nombre real de la sesión activa */}
          <span className="text-sm text-text/90">Admin</span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}