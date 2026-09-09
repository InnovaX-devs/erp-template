"use client";

import { useState, useMemo } from "react";
import { guardarFormulaDecant } from "@/app/(dashboard)/productos/actions";
import { calcularPreciosDecant } from "@/lib/calculos/decants";

interface FormulaDecantModalProps {
  isOpen: boolean;
  onClose: () => void;
  costoEnvaseDecantARSInicial: number;
  multiplicadorInsumoDecantInicial: number;
  divisorFrascoDecantInicial: number;
  offsetDecant5mlARSInicial: number;
  cotizacionUSD: number;
}

export function FormulaDecantModal({
  isOpen,
  onClose,
  costoEnvaseDecantARSInicial,
  multiplicadorInsumoDecantInicial,
  divisorFrascoDecantInicial,
  offsetDecant5mlARSInicial,
  cotizacionUSD,
}: FormulaDecantModalProps) {
  const [costoEnvaseDecantARS, setCostoEnvaseDecantARS] = useState(
    costoEnvaseDecantARSInicial.toString()
  );
  const [multiplicadorInsumoDecant, setMultiplicadorInsumoDecant] = useState(
    multiplicadorInsumoDecantInicial.toString()
  );
  const [divisorFrascoDecant, setDivisorFrascoDecant] = useState(
    divisorFrascoDecantInicial.toString()
  );
  const [offsetDecant5mlARS, setOffsetDecant5mlARS] = useState(
    offsetDecant5mlARSInicial.toString()
  );

  const [costoFrascoUSD, setCostoFrascoUSD] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

  const resultado = useMemo(() => {
    const costo = Number(costoFrascoUSD);
    const envase = Number(costoEnvaseDecantARS);
    const mult = Number(multiplicadorInsumoDecant);
    const divisor = Number(divisorFrascoDecant);
    const offset = Number(offsetDecant5mlARS);

    if (
      !costo ||
      !Number.isFinite(envase) ||
      !Number.isFinite(mult) ||
      !Number.isFinite(divisor) ||
      !Number.isFinite(offset)
    ) {
      return null;
    }

    try {
      return calcularPreciosDecant({
        costoFrascoUSD: costo,
        cotizacionUSD,
        costoEnvaseDecantARS: envase,
        multiplicadorInsumoDecant: mult,
        divisorFrascoDecant: divisor,
        offsetDecant5mlARS: offset,
      });
    } catch {
      return null;
    }
  }, [
    costoFrascoUSD,
    costoEnvaseDecantARS,
    multiplicadorInsumoDecant,
    divisorFrascoDecant,
    offsetDecant5mlARS,
    cotizacionUSD,
  ]);

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
              Parámetros usados para calcular el precio de venta de los decants.
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1 block text-sm text-text-dim"
                  htmlFor="costoEnvaseDecantARS"
                >
                  Costo fijo del envase (ARS)
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
                  Multiplicador sobre el costo
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

              <div>
                <label
                  className="mb-1 block text-sm text-text-dim"
                  htmlFor="divisorFrascoDecant"
                >
                  Decants de 10ml por frasco
                </label>
                <input
                  id="divisorFrascoDecant"
                  name="divisorFrascoDecant"
                  type="number"
                  step="1"
                  min="1"
                  value={divisorFrascoDecant}
                  onChange={(e) => setDivisorFrascoDecant(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text"
                  required
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm text-text-dim"
                  htmlFor="offsetDecant5mlARS"
                >
                  Adicional decant 5ml (ARS)
                </label>
                <input
                  id="offsetDecant5mlARS"
                  name="offsetDecant5mlARS"
                  type="number"
                  step="0.01"
                  min="0"
                  value={offsetDecant5mlARS}
                  onChange={(e) => setOffsetDecant5mlARS(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text"
                  required
                />
              </div>
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
              Vista previa
            </h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-text-dim" htmlFor="costoFrascoUSD">
                Costo del frasco (USD)
              </label>
              <input
                id="costoFrascoUSD"
                type="number"
                min="0"
                step="0.01"
                value={costoFrascoUSD}
                onChange={(e) => setCostoFrascoUSD(e.target.value)}
                className="w-full max-w-xs rounded-md border border-border bg-surface px-3 py-2 text-text"
              />
            </div>

            <p className="mb-4 text-xs text-text-dim">
              Cotización USD usada: {cotizacionUSD.toLocaleString("es-AR")}
            </p>

            {resultado ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-border p-3">
                  <p className="mb-1 text-sm text-text-dim">Decant 10ml</p>
                  <p className="font-display text-lg font-semibold text-text">
                    {formatARS(resultado.decant10ml)}
                  </p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="mb-1 text-sm text-text-dim">Decant 5ml</p>
                  <p className="font-display text-lg font-semibold text-text">
                    {formatARS(resultado.decant5ml)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-dim">
                Ingresá el costo del frasco en USD para ver los precios calculados.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}