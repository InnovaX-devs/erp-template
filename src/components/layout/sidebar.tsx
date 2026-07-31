"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/nav-items";
import { AromaLine } from "@/components/ui/aroma-line";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-ink text-ivory">
      <div className="px-6 pt-8 pb-6">
        <span className="font-display text-2xl tracking-wide">Esencia</span>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ivory/50">
          Panel administrativo
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-white/[0.06] text-ivory"
                  : "text-ivory/60 hover:bg-white/[0.04] hover:text-ivory/90"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-amber transition-opacity",
                  isActive ? "opacity-100" : "opacity-0"
                )}
                aria-hidden="true"
              />
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6">
        <AromaLine className="w-full text-amber/60" />
        <p className="mt-3 text-[11px] text-ivory/35">Esencia · v0.1</p>
      </div>
    </aside>
  );
}