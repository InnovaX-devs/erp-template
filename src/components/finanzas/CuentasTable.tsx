"use client";

import { Eye, Pencil, Power, Trash2, Star } from "lucide-react";
import type { CuentaDTO, TipoCuenta } from "@/types/cuenta";

const TIPO_LABEL: Record<TipoCuenta, string> = {
  EFECTIVO_ARS: "Efectivo ARS",
  EFECTIVO_USD: "Efectivo USD",
  BANCO_ARS: "Banco ARS",
  BANCO_USD: "Banco USD",
};

function esUSD(tipo: TipoCuenta) {
  return tipo === "EFECTIVO_USD" || tipo === "BANCO_USD";
}

function formatMonto(monto: number, tipo: TipoCuenta) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: esUSD(tipo) ? "USD" : "ARS",
  }).format(monto);
}

interface Props {
  cuentas: CuentaDTO[];
  onEditar: (cuenta: CuentaDTO) => void;
  onToggleActiva: (cuenta: CuentaDTO) => void;
  onEliminar: (cuenta: CuentaDTO) => void;
  onVerMovimientos: (cuenta: CuentaDTO) => void;
}

export function CuentasTable({
  cuentas,
  onEditar,
  onToggleActiva,
  onEliminar,
  onVerMovimientos,
}: Props) {
  if (cuentas.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-dim">
        No hay cuentas para mostrar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-hover/40 text-left text-xs font-medium uppercase tracking-wider text-text-dim">
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Alias</th>
            <th className="px-4 py-3 text-right">Saldo</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cuentas.map((c) => (
            <tr
              key={c.id}
              className={`border-b border-border last:border-0 hover:bg-surface-hover/30 ${
                !c.activa ? "opacity-50" : ""
              }`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color ?? "#999" }}
                  />
                  <span className="font-medium text-text">{c.nombre}</span>
                  {c.favorita && (
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  )}
                  {!c.activa && (
                    <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[10px] text-text-dim">
                      Inactiva
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-text-dim">{TIPO_LABEL[c.tipo]}</td>
              <td className="px-4 py-3 text-text-dim">{c.alias || "—"}</td>
              <td className="px-4 py-3 text-right font-medium text-text">
                {formatMonto(c.saldoActual, c.tipo)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onVerMovimientos(c)}
                    title="Ver movimientos"
                    className="rounded-lg p-1.5 text-text-dim hover:bg-surface-hover hover:text-text"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditar(c)}
                    title="Editar"
                    className="rounded-lg p-1.5 text-text-dim hover:bg-surface-hover hover:text-text"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggleActiva(c)}
                    title={c.activa ? "Desactivar" : "Activar"}
                    className="rounded-lg p-1.5 text-text-dim hover:bg-surface-hover hover:text-text"
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEliminar(c)}
                    title="Eliminar"
                    className="rounded-lg p-1.5 text-text-dim hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}