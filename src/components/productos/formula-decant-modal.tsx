"use client";

import { useState, useMemo } from "react";
import { guardarFormulaDecant } from "@/app/(dashboard)/productos/formula-decant/actions";
import { simularFormulaDecant } from "@/lib/calculos/decants";

interface FormulaDecantModalProps {
  isOpen: boolean;
  onClose: () => void;
  costoEnvaseDecantARSInicial: number;
  multiplicadorInsumoDecantInicial: number;
  cotizacionUSD: number;
}

export function FormulaDecantModal({
  isOpen,
  onClose,
  costoEnvaseDecantARSInicial,
  multiplicadorInsumoDecantInicial,
  cotizacionUSD,
}: FormulaDecantModalProps) {
  const [costoEnvaseDecantARS, setCostoEnvaseDecantARS] = useState(
    costoEnvaseDecantARSInicial.toString()
  );
  const [multiplicadorInsumoDecant, setMultiplicadorInsumoDecant] = useState(
    multiplicadorInsumoDecantInicial.toString()
  );

  const [mlPerfume, setMlPerfume] = useState("100");
  const [precioTotalUSD, setPrecioTotalUSD] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

  const simulacion = useMemo(() => {
    const ml = Number(mlPerfume);
    const precio = Number(precioTotalUSD);
    const envase = Number(costoEnvaseDecantARS);
    const mult = Number(multiplicadorInsumoDecant);

    if (!ml || !precio || !Number.isFinite(envase) || !Number.isFinite(mult)) {
      return null;
    }

    try {
      return simularFormulaDecant({
        mlPerfume: ml,
        precioTotalUSD: precio,
        cotizacionUSD,
        costoEnvaseDecantARS: envase,
        multiplicadorInsumoDecant: mult,
      });
    } catch {
      return null;
    }
  }, [mlPerfume, precioTotalUSD, costoEnvaseDecantARS, multiplicadorInsumoDecant, cotizacionUSD]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setGuardadoOk(false);
    setGuardando(true);
    try {
      await guardarFormulaDecant(formData);
      setGuardadoOk(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar la fórmula");
    } finally {
      setGuardando(false);
    }
  }

  const formatARS = (valor: number) =>
    valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-text">
              Fórmula de Decants
            </h2>
            <p className="text-sm text-text-dim">
              Parámetros para calcular el precio sugerido de los decants.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-dim hover:text-text"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <form action={handleSubmit} className="space-y-4 rounded-lg border border-border p-4">
            <div>
              <label
                className="mb-1 block text-sm text-text-dim"
                htmlFor="costoEnvaseDecantARS"
              >
                Costo del envase (ARS)
              </label>
              <input
                id="costoEnvaseDecantARS"
                name="costoEnvaseDecantARS"
                type="number"
                step="0.01"
                min="0"
                value={costoEnvaseDecantARS}
                onChange={(e) => setCostoEnvaseDecantARS(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text"
                required
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm text-text-dim"
                htmlFor="multiplicadorInsumoDecant"
              >
                Multiplicador de insumo
              </label>
              <input
                id="multiplicadorInsumoDecant"
                name="multiplicadorInsumoDecant"
                type="number"
                step="0.01"
                min="0"
                value={multiplicadorInsumoDecant}
                onChange={(e) => setMultiplicadorInsumoDecant(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text"
                required
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}
            {guardadoOk && (
              <p className="text-sm text-success">Fórmula guardada correctamente.</p>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar fórmula"}
            </button>
          </form>

          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-4 font-display text-base font-semibold text-text">
              Simulador
            </h3>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-text-dim" htmlFor="mlPerfume">
                  ML del perfume
                </label>
                <input
                  id="mlPerfume"
                  type="number"
                  min="1"
                  value={mlPerfume}
                  onChange={(e) => setMlPerfume(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text"
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-sm text-text-dim"
                  htmlFor="precioTotalUSD"
                >
                  Costo total del perfume (USD)
                </label>
                <input
                  id="precioTotalUSD"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioTotalUSD}
                  onChange={(e) => setPrecioTotalUSD(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text"
                />
              </div>
            </div>

            <p className="mb-4 text-xs text-text-dim">
              Cotización USD usada: {cotizacionUSD.toLocaleString("es-AR")}
            </p>

            {simulacion ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Decant 5ml", data: simulacion.decant5ml },
                  { label: "Decant 10ml", data: simulacion.decant10ml },
                ].map(({ label, data }) => (
                  <div key={label} className="rounded-md border border-border p-3">
                    <p className="mb-1 text-sm text-text-dim">{label}</p>
                    <p className="font-display text-lg font-semibold text-text">
                      {formatARS(data.precioSugerido)}
                    </p>
                    <p className="mt-1 text-xs text-text-dim">
                      {formatARS(data.costoNetoARS)} × {multiplicadorInsumoDecant} +{" "}
                      {formatARS(Number(costoEnvaseDecantARS))}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-dim">
                Completá los ml y el costo del perfume para ver la simulación.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}