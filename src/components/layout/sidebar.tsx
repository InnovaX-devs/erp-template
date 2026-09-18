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

// Clases compartidas por todos los ítems del menú. Antes usaban text-text-dim
// y hover:bg-surface-hover, que son tokens pensados para fondo claro y sobre
// el sidebar oscuro quedaban ilegibles. Ahora van con blancos translúcidos.
const ITEM_BASE =
  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors";
const ITEM_INACTIVO = "text-white/55 hover:bg-white/[0.06] hover:text-white";
const ITEM_ACTIVO = "bg-white/[0.07] text-white";

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

function iniciales(nombre: string) {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "";
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

export function Sidebar({
  logoUrl,
  nombreNegocio,
  eslogan,
  premium,
}: {
  logoUrl: string | null;
  nombreNegocio: string;
  eslogan?: string | null;
  premium: boolean;
}) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  const navItems = NAV_ITEMS.filter((item) => esGrupo(item) || !item.premium || premium).map((item) =>
    esGrupo(item) ? { ...item, children: item.children.filter((c) => !c.premium || premium) } : item
  );

  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(() => {
    const activo = navItems.find(
      (item) => esGrupo(item) && grupoTieneRutaActiva(item, pathname)
    );
    return activo ? activo.label : null;
  });

  useEffect(() => {
    const activo = navItems.find(
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
          "bg-sidebar fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col text-ivory transition-transform duration-200 ease-out",
          "md:static md:z-auto md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center px-6 pt-8 pb-6 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-primary-soft/70 shadow-[0_0_24px_-6px_rgba(34,197,94,0.55)]">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`Logo ${nombreNegocio}`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-lg tracking-wide text-primary-soft">
                {iniciales(nombreNegocio)}
              </span>
            )}
          </div>

          <span className="font-display text-lg tracking-wide text-white">
            {nombreNegocio}
          </span>

          {eslogan && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              {eslogan}
            </p>
          )}
        </div>

        <nav
          className="sidebar-scroll relative z-10 flex-1 space-y-1 overflow-y-auto px-3 pb-4"
          aria-label="Navegación principal"
        >
          {/* INICIO */}
          <Link
            href="/"
            onClick={close}
            aria-current={pathname === "/" ? "page" : undefined}
            className={cn(ITEM_BASE, pathname === "/" ? ITEM_ACTIVO : ITEM_INACTIVO)}
          >
            <span
              className={cn(
                "bg-grad absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full transition-opacity",
                pathname === "/" ? "opacity-100" : "opacity-0"
              )}
              aria-hidden="true"
            />

            <House className="h-4 w-4" strokeWidth={1.75} />

            <span>Inicio</span>
          </Link>

          {/* RESTO DEL MENÚ */}
          {navItems.map((item) => {
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
                      "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      tieneActivo ? "text-white" : ITEM_INACTIVO
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
                              isActive ? ITEM_ACTIVO : ITEM_INACTIVO
                            )}
                          >
                            <span
                              className={cn(
                                "bg-grad absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full transition-opacity",
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
                className={cn(ITEM_BASE, isActive ? ITEM_ACTIVO : ITEM_INACTIVO)}
              >
                <span
                  className={cn(
                    "bg-grad absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full transition-opacity",
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

        <div className="relative z-10 px-6 py-6">
          <AromaLine className="w-full text-primary-soft/50" />

          <p className="mt-3 font-mono text-[10px] text-white/35">
            {nombreNegocio} · v0.1
          </p>
        </div>
      </aside>
    </>
  );
}