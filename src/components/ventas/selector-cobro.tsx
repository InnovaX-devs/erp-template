"use client";

import { useState } from "react";
import { CreditCard, Plus, X } from "lucide-react";
import { SelectorCuentaModal } from "./selector-cuenta-modal";
import { formatCurrency } from "@/lib/currency";
import type { ModoCobro, PagoLinea, CuentaOption } from "@/types/pago";

interface Props {
  total: number;
  tieneCliente: boolean;
  modo: ModoCobro;
  pagos: PagoLinea[];
  onCambiarModo: (modo: ModoCobro) => void;
  onCambiarPagos: (pagos: PagoLinea[]) => void;
}

export function SelectorCobro({ total, tieneCliente, modo, pagos, onCambiarModo, onCambiarPagos }: Props) {
  const [cuentasCache, setCuentasCache] = useState<Record<number, CuentaOption>>({});
  const [filaSeleccionandoCuenta, setFilaSeleccionandoCuenta] = useState<string | null>(null);

  const sumaPagada = pagos.reduce((acc, p) => acc + p.monto, 0);
  const diferencia = total - sumaPagada;

  function abrirSelectorCuenta(filaId: string) {
    setFilaSeleccionandoCuenta(filaId);
  }

  function elegirCuenta(cuenta: CuentaOption) {
    setCuentasCache((prev) => ({ ...prev, [cuenta.id]: cuenta }));
    onCambiarPagos(
      pagos.map((p) => (p.id === filaSeleccionandoCuenta ? { ...p, cuentaId: cuenta.id } : p))
    );
    setFilaSeleccionandoCuenta(null);
  }

  function cambiarMonto(filaId: string, monto: number) {
    onCambiarPagos(pagos.map((p) => (p.id === filaId ? { ...p, monto } : p)));
  }

  function agregarFila() {
    onCambiarPagos([...pagos, { id: `pago-${Date.now()}`, cuentaId: null, monto: 0 }]);
  }

  function eliminarFila(filaId: string) {
    onCambiarPagos(pagos.filter((p) => p.id !== filaId));
  }

  function completarResto(filaId: string) {
    const otras = pagos.filter((p) => p.id !== filaId).reduce((acc, p) => acc + p.monto, 0);
    const resto = Math.max(0, total - otras);
    cambiarMonto(filaId, resto);
  }

  function cambiarModo(nuevoModo: ModoCobro) {
    if (nuevoModo === "A_CUENTA" && !tieneCliente) return; // bloqueado sin cliente
    onCambiarModo(nuevoModo);
    if (nuevoModo === "UNICA") {
      onCambiarPagos([{ id: "pago-unica", cuentaId: pagos[0]?.cuentaId ?? null, monto: total }]);
    } else if (nuevoModo === "MIXTO" && pagos.length < 2) {
      onCambiarPagos([
        { id: "pago-1", cuentaId: null, monto: 0 },
        { id: "pago-2", cuentaId: null, monto: 0 },
      ]);
    } else if (nuevoModo === "A_CUENTA") {
      onCambiarPagos([{ id: "pago-acuenta", cuentaId: pagos[0]?.cuentaId ?? null, monto: 0 }]);
    }
  }

  const esValido =
    modo === "A_CUENTA"
      ? sumaPagada >= 0 && sumaPagada <= total && pagos.every((p) => p.cuentaId != null)
      : Math.abs(diferencia) < 0.01 && pagos.every((p) => p.cuentaId != null && p.monto > 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-text-dim">Cobro</span>
        <div className="flex rounded-lg border border-border bg-surface p-0.5">
          <button
            type="button"
            onClick={() => cambiarModo("UNICA")}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              modo === "UNICA" ? "bg-primary text-white" : "text-text-dim hover:text-text"
            }`}
          >
            Única
          </button>
          <button
            type="button"
            onClick={() => cambiarModo("MIXTO")}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              modo === "MIXTO" ? "bg-primary text-white" : "text-text-dim hover:text-text"
            }`}
          >
            Mixto
          </button>
          <button
            type="button"
            onClick={() => cambiarModo("A_CUENTA")}
            disabled={!tieneCliente}
            title={!tieneCliente ? "Seleccioná un cliente para usar 'A cuenta'" : undefined}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              modo === "A_CUENTA" ? "bg-primary text-white" : "text-text-dim hover:text-text"
            }`}
          >
            A cuenta
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {pagos.map((pago) => (
          <div key={pago.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => abrirSelectorCuenta(pago.id)}
              className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm text-text hover:bg-surface-hover"
            >
              <CreditCard size={14} className="text-text-dim" />
              {pago.cuentaId != null ? cuentasCache[pago.cuentaId]?.nombre ?? "Cuenta" : "Seleccionar cuenta..."}
            </button>

            <div className="relative w-32">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-text-dim">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pago.monto || ""}
                onChange={(e) => cambiarMonto(pago.id, Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-surface py-2 pl-5 pr-2 text-right text-sm text-text focus:border-primary focus:outline-none"
              />
            </div>

            {modo === "MIXTO" && (
              <button
                type="button"
                onClick={() => completarResto(pago.id)}
                className="whitespace-nowrap rounded-lg border border-border bg-surface px-2 py-2 text-xs font-medium text-text-dim hover:bg-surface-hover"
              >
                Resto
              </button>
            )}

            {modo === "MIXTO" && pagos.length > 2 && (
              <button
                type="button"
                onClick={() => eliminarFila(pago.id)}
                className="text-text-dim hover:text-danger"
                aria-label="Quitar fila"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}

        {modo === "MIXTO" && (
          <button
            type="button"
            onClick={agregarFila}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus size={12} /> Agregar cuenta
          </button>
        )}
      </div>

      {modo === "MIXTO" && (
        <p className={`text-xs ${Math.abs(diferencia) < 0.01 ? "text-success" : "text-danger"}`}>
          {Math.abs(diferencia) < 0.01
            ? "El reparto coincide con el total ✓"
            : diferencia > 0
              ? `Falta repartir ${formatCurrency(diferencia, "ARS")}`
              : `Te pasaste por ${formatCurrency(-diferencia, "ARS")}`}
        </p>
      )}

      {modo === "A_CUENTA" && sumaPagada < total && (
        <p className="text-xs text-warning">
          Queda como deuda del cliente: {formatCurrency(total - sumaPagada, "ARS")}
        </p>
      )}

      {!esValido && modo !== "MIXTO" && pagos.some((p) => p.cuentaId == null) && (
        <p className="text-xs text-danger">Falta seleccionar la cuenta</p>
      )}

      {filaSeleccionandoCuenta && (
        <SelectorCuentaModal onSeleccionar={elegirCuenta} onClose={() => setFilaSeleccionandoCuenta(null)} />
      )}
    </div>
  );
}