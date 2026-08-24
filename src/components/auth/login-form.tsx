"use client";
import { useState } from "react";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import type React from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email o contraseña incorrectos.");
        toast.error("Email o contraseña incorrectos.");
        return;
      }

      toast.success("Bienvenido/a de nuevo");
      window.location.href = "/";
    } catch {
      setError("No pudimos conectarnos al servidor. Revisá tu conexión.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-clay/30 bg-clay-soft px-3 py-2.5 text-sm text-clay"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-amber"
          placeholder="admin@esencia.com"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink/80">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={mostrarPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-amber"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setMostrarPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 transition-colors hover:text-ink/70"
            tabIndex={-1}
            aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}