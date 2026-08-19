"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { X, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cambiarPassword } from "@/app/(dashboard)/configuracion/actions"; // ⚠️ ajustar si tu ruta real es otra

interface CambiarPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function CambiarPasswordModal({ open, onClose }: CambiarPasswordModalProps) {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPasswords, setMostrarPasswords] = useState(false);
  const [pendiente, startTransition] = useTransition();

  function limpiarYCerrar() {
    setPasswordActual("");
    setPasswordNueva("");
    setConfirmarPassword("");
    setMostrarPasswords(false);
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!passwordActual || !passwordNueva || !confirmarPassword) {
      toast.error("Completá todos los campos");
      return;
    }

    if (passwordNueva.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (passwordNueva !== confirmarPassword) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }

    startTransition(async () => {
      try {
        await cambiarPassword(passwordActual, passwordNueva);
        toast.success("Contraseña actualizada correctamente");
        limpiarYCerrar();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
      }
    });
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={limpiarYCerrar}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-bg p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h2 className="font-display text-base font-semibold text-text">Cambiar contraseña</h2>
          </div>
          <button
            type="button"
            onClick={limpiarYCerrar}
            className="rounded p-1 text-text/60 hover:bg-surface-hover"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-text/60">Contraseña actual</label>
            <input
              type={mostrarPasswords ? "text" : "password"}
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              disabled={pendiente}
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-text/60">Contraseña nueva</label>
            <input
              type={mostrarPasswords ? "text" : "password"}
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              disabled={pendiente}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-text/60">Confirmar contraseña nueva</label>
            <input
              type={mostrarPasswords ? "text" : "password"}
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              disabled={pendiente}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setMostrarPasswords((v) => !v)}
            className="flex items-center gap-1 text-xs text-text/60 hover:text-text"
          >
            {mostrarPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {mostrarPasswords ? "Ocultar" : "Mostrar"} contraseñas
          </button>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={limpiarYCerrar}
              disabled={pendiente}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-text hover:bg-surface-hover disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pendiente}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {pendiente ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}