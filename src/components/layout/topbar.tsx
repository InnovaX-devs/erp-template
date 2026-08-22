"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Menu, Check, X as XIcon, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { NAV_ITEMS, esGrupo } from "@/lib/nav-items";
import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSidebar } from "@/components/layout/sidebar-context";
import { CambiarPasswordModal } from "@/components/layout/cambiar-password-modal"; // ⚠️ ajustar si tu ruta real es otra
import { actualizarCotizacionRapida } from "@/app/(dashboard)/configuracion/actions"; // ⚠️ ajustar si tu ruta real es otra

function useSectionTitle() {
  const pathname = usePathname();

  let mejorLabel: string | null = null;
  let mejorLargo = -1;

  function evaluar(href: string, label: string) {
    const coincide = pathname === href || pathname?.startsWith(`${href}/`);
    if (coincide && href.length > mejorLargo) {
      mejorLargo = href.length;
      mejorLabel = label;
    }
  }

  for (const item of NAV_ITEMS) {
    if (esGrupo(item)) {
      for (const child of item.children) {
        evaluar(child.href, child.label);
      }
    } else {
      evaluar(item.href, item.label);
    }
  }

  return mejorLabel ?? "Panel";
}

export function Topbar({ cotizacionUSD }: { cotizacionUSD: number }) {
  const title = useSectionTitle();
  const { toggle } = useSidebar();

  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(String(cotizacionUSD));
  const [pendiente, startTransition] = useTransition();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const cotizacionFormateada = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
  }).format(cotizacionUSD);

  function iniciarEdicion() {
    setValor(String(cotizacionUSD));
    setEditando(true);
  }

  function cancelar() {
    setValor(String(cotizacionUSD));
    setEditando(false);
  }

  function guardar() {
    const nueva = Number(valor);
    if (!nueva || Number.isNaN(nueva) || nueva <= 0) {
      toast.error("Ingresá una cotización válida");
      return;
    }
    if (nueva === cotizacionUSD) {
      setEditando(false);
      return;
    }

    startTransition(async () => {
      try {
        await actualizarCotizacionRapida(nueva);
        toast.success("Cotización actualizada");
        setEditando(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo actualizar la cotización");
        setValor(String(cotizacionUSD));
      }
    });
  }

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
        {editando ? (
          <div className="hidden items-center gap-1 rounded-full border border-primary bg-surface px-2 py-1 sm:flex">
            <span className="text-xs text-text/60">USD</span>
            <span className="font-mono text-sm text-text">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              autoFocus
              value={valor}
              disabled={pendiente}
              onChange={(e) => setValor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") guardar();
                if (e.key === "Escape") cancelar();
              }}
              onBlur={guardar}
              className="w-20 bg-transparent font-mono text-sm font-medium text-text focus:outline-none"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={guardar}
              disabled={pendiente}
              className="rounded p-0.5 text-success hover:bg-success/10 disabled:opacity-50"
              title="Guardar"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancelar}
              disabled={pendiente}
              className="rounded p-0.5 text-danger hover:bg-danger/10 disabled:opacity-50"
              title="Cancelar"
            >
              <XIcon size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={iniciarEdicion}
            className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 transition-colors hover:border-primary sm:flex"
            title="Editar cotización"
          >
            <span className="text-xs text-text/60">USD</span>
            <span className="font-mono text-sm font-medium text-text">${cotizacionFormateada}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setPasswordModalOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text hover:bg-surface-hover"
          title="Cambiar contraseña"
          aria-label="Cambiar contraseña"
        >
          <KeyRound className="h-4 w-4" />
        </button>

        <LogoutButton />
      </div>

      <CambiarPasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </header>
  );
}