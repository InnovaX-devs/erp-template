"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/login" });
      toast.success("Sesión cerrada");
    } catch {
      toast.error("No se pudo cerrar la sesión. Intentá de nuevo.");
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex items-center cursor-pointer gap-2 rounded-lg border border-ink/10 px-3 py-2 text-sm text-ink/70 transition-colors hover:border-clay/40 hover:bg-clay/5 hover:text-clay disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" strokeWidth={1.75} />
      <span className="hidden sm:inline">Cerrar sesión</span>
    </button>
  );
}