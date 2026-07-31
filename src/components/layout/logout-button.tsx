"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      // TODO: reemplazar por la lógica real de destrucción de sesión
      // al resolver el issue de autenticación.
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Sesión cerrada");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("No se pudo cerrar la sesión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-sm text-ink/70 transition-colors hover:border-clay/40 hover:bg-clay/5 hover:text-clay disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" strokeWidth={1.75} />
      <span className="hidden sm:inline">Cerrar sesión</span>
    </button>
  );
}