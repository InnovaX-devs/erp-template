"use client";

import { useRef, useState } from "react";
import { guardarConfiguracion } from "@/app/(dashboard)/configuracion/actions";

interface ConfiguracionFormProps {
  configuracion: {
    nombreNegocio: string;
    logoUrl: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    cotizacionUSD: number;
    remitenteNombre: string | null;
    remitenteDni: string | null;
    costoPromedioPonderado: boolean;
  };
}

export function ConfiguracionForm({ configuracion }: ConfiguracionFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(configuracion.logoUrl);
  const [logoRemovido, setLogoRemovido] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

  function handleSeleccionarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setLogoRemovido(false);
  }

  function handleQuitarLogo() {
    setPreviewUrl(null);
    setLogoRemovido(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setGuardadoOk(false);
    setGuardando(true);
    try {
      await guardarConfiguracion(formData);
      setGuardadoOk(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar la configuración");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Identidad del negocio */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-text">
          Identidad del negocio
        </h2>

        <div className="mb-5">
          <label className="mb-1 block text-sm text-text-dim" htmlFor="nombreNegocio">
            Nombre del negocio
          </label>
          <input
            id="nombreNegocio"
            type="text"
            name="nombreNegocio"
            defaultValue={configuracion.nombreNegocio}
            required
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-text-dim">Logo</label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Logo del negocio"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs text-text-dim">Sin logo</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-hover"
              >
                {previewUrl ? "Cambiar imagen" : "Subir imagen"}
              </button>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleQuitarLogo}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-danger hover:bg-surface-hover"
                >
                  Quitar logo
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            name="logo"
            accept="image/png, image/jpeg"
            onChange={handleSeleccionarArchivo}
            className="hidden"
          />
          <input type="hidden" name="removerLogo" value={logoRemovido ? "true" : "false"} />
          <p className="mt-2 text-xs text-text-dim">PNG o JPG.</p>
        </div>
      </div>

      {/* Contacto */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-text">Contacto</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-text-dim" htmlFor="telefono">
              Teléfono / WhatsApp
            </label>
            <input
              id="telefono"
              type="text"
              name="telefono"
              defaultValue={configuracion.telefono ?? ""}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-dim" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              defaultValue={configuracion.email ?? ""}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:border-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-text-dim" htmlFor="direccion">
              Dirección
            </label>
            <input
              id="direccion"
              type="text"
              name="direccion"
              defaultValue={configuracion.direccion ?? ""}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Cotización */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-text">Cotización</h2>
        <label className="mb-1 block text-sm text-text-dim" htmlFor="cotizacionUSD">
          Cotización USD
        </label>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">$</span>
          <input
            id="cotizacionUSD"
            type="number"
            name="cotizacionUSD"
            defaultValue={configuracion.cotizacionUSD}
            step="0.01"
            min="0"
            required
            className="w-full rounded-md border border-border bg-surface px-3 py-2 pl-7 text-text focus:border-primary focus:outline-none"
          />
        </div>
        <p className="mt-1 text-xs text-text-dim">
          Usada para convertir precios en USD a ARS en todo el sistema.
        </p>
      </div>

      {/* Datos del remitente */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-text">
          Datos del remitente
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-text-dim" htmlFor="remitenteNombre">
              Nombre y apellido
            </label>
            <input
              id="remitenteNombre"
              type="text"
              name="remitenteNombre"
              defaultValue={configuracion.remitenteNombre ?? ""}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-dim" htmlFor="remitenteDni">
              DNI
            </label>
            <input
              id="remitenteDni"
              type="text"
              name="remitenteDni"
              defaultValue={configuracion.remitenteDni ?? ""}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-text">Preferencias</h2>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            name="costoPromedioPonderado"
            defaultChecked={configuracion.costoPromedioPonderado}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            <span className="text-sm font-medium text-text">Costo promedio ponderado</span>
            <p className="text-xs text-text-dim">
              Al confirmar una compra, el costo del producto se recalcula mezclando el stock
              anterior con el nuevo. Ejemplo: 10 unidades a $1000 + 5 nuevas a $1200 → el costo
              pasa a $1066.
            </p>
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {guardadoOk && (
        <p className="text-sm text-success">Configuración guardada correctamente.</p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}