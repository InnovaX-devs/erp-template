"use client";

import { useEffect, useState, useCallback } from "react";
import { Pencil, Ban, Trash2, Wallet, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CuentaFormModal, type CuentaFormData } from "@/components/finanzas/cuenta-form-modal";
import type { CuentaDTO } from "@/types/cuenta";
import { formatCurrency } from "@/lib/currency";

const ETIQUETAS_TIPO: Record<string, string> = {
  EFECTIVO_ARS: "Efectivo ARS",
  EFECTIVO_USD: "Efectivo USD",
  BANCO_ARS: "Banco ARS",
  BANCO_USD: "Banco USD",
};

export default function FinanzasPage() {
  const [cuentas, setCuentas] = useState<CuentaDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuentaEditar, setCuentaEditar] = useState<CuentaDTO | null>(null);

  const cargarCuentas = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/cuentas?incluirInactivas=true");
      const data = await res.json();
      setCuentas(data.items ?? []);
    } catch {
      toast.error("No se pudieron cargar las cuentas");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCuentas();
  }, [cargarCuentas]);

  function abrirNueva() {
    setCuentaEditar(null);
    setModalAbierto(true);
  }

  function abrirEditar(cuenta: CuentaDTO) {
    setCuentaEditar(cuenta);
    setModalAbierto(true);
  }

  async function toggleActiva(cuenta: CuentaDTO) {
    try {
      const res = await fetch(`/api/cuentas/${cuenta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !cuenta.activa }),
      });
      if (!res.ok) throw new Error();
      toast.success(cuenta.activa ? "Cuenta desactivada" : "Cuenta reactivada");
      cargarCuentas();
    } catch {
      toast.error("No se pudo cambiar el estado de la cuenta");
    }
  }

  async function eliminar(cuenta: CuentaDTO) {
    if (!confirm(`¿Eliminar la cuenta "${cuenta.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/cuentas/${cuenta.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo eliminar la cuenta");
        return;
      }
      toast.success("Cuenta eliminada");
      cargarCuentas();
    } catch {
      toast.error("No se pudo eliminar la cuenta");
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Cuentas financieras</h1>
          <p className="text-sm text-text-dim">{cuentas.length} cuentas configuradas</p>
        </div>
        <button
          onClick={abrirNueva}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={16} /> Nueva cuenta
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-text-dim">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Alias</th>
              <th className="px-4 py-3 text-right">Saldo</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-dim">Cargando...</td>
              </tr>
            )}
            {!cargando && cuentas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-dim">
                  No hay cuentas creadas todavía.
                </td>
              </tr>
            )}
            {cuentas.map((cuenta) => (
              <tr key={cuenta.id} className={`border-b border-border last:border-0 ${!cuenta.activa ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cuenta.color ?? "#94a3b8" }}
                    />
                    <span className="font-medium text-text">{cuenta.nombre}</span>
                    {cuenta.favorita && <span className="text-xs text-warning">★</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-dim">{ETIQUETAS_TIPO[cuenta.tipo]}</td>
                <td className="px-4 py-3 text-text-dim">{cuenta.alias || "—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-text">
                  {formatCurrency(cuenta.saldoActual, cuenta.tipo.endsWith("USD") ? "USD" : "ARS")}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      cuenta.activa ? "bg-success/10 text-success" : "bg-text-dim/10 text-text-dim"
                    }`}
                  >
                    {cuenta.activa ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => toast.info("Ver movimientos: próximamente")}
                      className="rounded-lg p-1.5 text-text-dim hover:bg-surface-hover hover:text-text"
                      title="Ver movimientos"
                    >
                      <Wallet size={16} />
                    </button>
                    <button
                      onClick={() => abrirEditar(cuenta)}
                      className="rounded-lg p-1.5 text-text-dim hover:bg-surface-hover hover:text-text"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => toggleActiva(cuenta)}
                      className="rounded-lg p-1.5 text-text-dim hover:bg-surface-hover hover:text-text"
                      title={cuenta.activa ? "Desactivar" : "Reactivar"}
                    >
                      {cuenta.activa ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                    <button
                      onClick={() => eliminar(cuenta)}
                      className="rounded-lg p-1.5 text-text-dim hover:bg-danger/10 hover:text-danger"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CuentaFormModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        cuentaEditar={cuentaEditar}
        onSuccess={cargarCuentas}
      />
    </div>
  );
}