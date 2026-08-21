"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, House, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, esGrupo, type NavGroup } from "@/lib/nav-items";
import { AromaLine } from "@/components/ui/aroma-line";
import { useSidebar } from "@/components/layout/sidebar-context";

function grupoTieneRutaActiva(grupo: NavGroup, pathname: string) {
  return grupo.children.some(
    (c) => pathname === c.href || pathname.startsWith(`${c.href}/`)
  );
}

// Devuelve el href más específico (más largo) entre los children de un grupo
// que matchea el pathname actual. Evita que una ruta padre como "/ventas"
// quede marcada activa cuando en realidad estás en "/ventas/historial".
function mejorMatchDeGrupo(grupo: NavGroup, pathname: string) {
  return grupo.children
    .filter((c) => pathname === c.href || pathname.startsWith(`${c.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function Sidebar({ logoUrl }: { logoUrl: string | null }) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(() => {
    const activo = NAV_ITEMS.find(
      (item) => esGrupo(item) && grupoTieneRutaActiva(item, pathname)
    );
    return activo ? activo.label : null;
  });

  useEffect(() => {
    const activo = NAV_ITEMS.find(
      (item) => esGrupo(item) && grupoTieneRutaActiva(item, pathname)
    );
    setGrupoAbierto(activo ? activo.label : null);
  }, [pathname]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-ink text-ivory transition-transform duration-200 ease-out",
          "md:static md:z-auto md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-ivory/60 hover:bg-white/10 hover:text-ivory md:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-amber">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo KJ Importados"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-lg tracking-wide text-amber">
                KJ
              </span>
            )}
          </div>

          <span className="font-display text-lg tracking-wide">
            KJ Importados
          </span>

          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ivory/50">
            Perfumes Árabes
          </p>
        </div>

        <nav
          className="sidebar-scroll flex-1 space-y-1 overflow-y-auto px-3 pb-4"
          aria-label="Navegación principal"
        >
          {/* INICIO */}
          <Link
            href="/"
            onClick={close}
            aria-current={pathname === "/" ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname === "/"
                ? "bg-white/[0.06] text-ivory"
                : "text-text-dim hover:bg-surface-hover hover:text-text"
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-amber transition-opacity",
                pathname === "/" ? "opacity-100" : "opacity-0"
              )}
              aria-hidden="true"
            />

            <House className="h-4 w-4" strokeWidth={1.75} />

            <span>Inicio</span>
          </Link>

          {/* RESTO DEL MENÚ */}
          {NAV_ITEMS.map((item) => {
            if (esGrupo(item)) {
              const Icon = item.icon;
              const abierto = grupoAbierto === item.label;
              const tieneActivo = grupoTieneRutaActiva(item, pathname);
              const activeHref = mejorMatchDeGrupo(item, pathname);

              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() =>
                      setGrupoAbierto(abierto ? null : item.label)
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      tieneActivo
                        ? "text-ivory"
                        : "text-text-dim hover:bg-surface-hover hover:text-text"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />

                    <span className="flex-1 text-left">
                      {item.label}
                    </span>

                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        abierto && "rotate-180"
                      )}
                      strokeWidth={2}
                    />
                  </button>

                  {abierto && (
                    <div className="mt-0.5 space-y-0.5 pl-4">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;

                        const isActive = child.href === activeHref;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={close}
                            aria-current={
                              isActive ? "page" : undefined
                            }
                            className={cn(
                              "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                              isActive
                                ? "bg-white/[0.06] text-ivory"
                                : "text-text-dim hover:bg-surface-hover hover:text-text"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-amber transition-opacity",
                                isActive
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                              aria-hidden="true"
                            />

                            <ChildIcon
                              className="h-3.5 w-3.5"
                              strokeWidth={1.75}
                            />

                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-white/[0.06] text-ivory"
                    : "text-text-dim hover:bg-surface-hover hover:text-text"
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-amber transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden="true"
                />

                <Icon
                  className="h-4 w-4"
                  strokeWidth={1.75}
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-6">
          <AromaLine className="w-full text-amber/60" />

          <p className="mt-3 text-[11px] text-ivory/35">
            KJ Importados · v0.1
          </p>
        </div>
      </aside>
    </>
  );
}