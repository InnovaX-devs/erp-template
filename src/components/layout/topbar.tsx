"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { LogoutButton } from "@/components/layout/logout-button";

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
    <header className="flex items-center justify-between border-b border-ink/10 bg-ivory/80 px-6 py-4 backdrop-blur">
      <h1 className="font-display text-xl text-ink">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 rounded-full border border-ink/10 bg-white px-2 py-1.5 pr-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber/15 text-xs font-medium text-amber-dark">
            AD
          </span>
          {/* TODO: reemplazar "Admin" por el nombre real de la sesión activa */}
          <span className="text-sm text-ink/80">Admin</span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}