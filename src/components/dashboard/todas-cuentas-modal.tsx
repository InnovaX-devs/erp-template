"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Copy } from "lucide-react";
import { toast } from "sonner";
import { FiltrosCuentas, type FiltroCategoria, type FiltroMoneda } from "@/components/finanzas/filtros-cuentas";
import { BarraLimiteMensual } from "@/components/finanzas/barra-limite-mensual";
import { formatCurrency } from "@/lib/currency";
import type { CuentaDTO } from "@/types/cuenta";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  saldoTotal: number;
}

function esBanco(tipo: CuentaDTO["tipo"]) {
  return tipo.startsWith("BANCO");
}

function esUSD(tipo: CuentaDTO["tipo"]) {
  return tipo.endsWith("USD");
}

export function TodasCuentasModal({ isOpen, onClose, saldoTotal }: Props) {
  const [cuentas, setCuentas] = useState<CuentaDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoria, setCategoria] = useState<FiltroCategoria>("TODAS");
  const [moneda, setMoneda] = useState<FiltroMoneda>("ARS_USD");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setCargando(true);
    fetch("/api/cuentas")
      .then((res) => res.json())
      .then((data) => setCuentas((data.items ?? []).filter((c: CuentaDTO) => c.activa)))
      .catch(() => toast.error("No se pudieron cargar las cuentas"))
      .finally(() => setCargando(false));
  }, [isOpen]);

  const filtradas = useMemo(() => {
    return cuentas.filter((c) => {
      if (categoria === "BANCO" && !esBanco(c.tipo)) return false;
      if (categoria === "EFECTIVO" && esBanco(c.tipo)) return false;
      if (moneda === "ARS" && esUSD(c.tipo)) return false;
      if (moneda === "USD" && !esUSD(c.tipo)) return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const enTexto = [c.nombre, c.alias, c.banco, c.titular]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
        if (!enTexto) return false;
      }
      return true;
    });
  }, [cuentas, categoria, moneda, busqueda]);

  if (!isOpen) return null;

  function copiarAlias(valor: string) {
    navigator.clipboard.writeText(valor);
    toast.success("Copiado al portapapeles");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-text">Todas las cuentas</h2>
            <p className="mt-0.5 text-sm text-text-dim">
              Saldo total: <span className="font-semibold text-text">{formatCurrency(saldoTotal, "ARS")}</span>
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-dim hover:bg-surface-hover hover:text-text">
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-border p-4">
          <FiltrosCuentas
            categoria={categoria}
            moneda={moneda}
            onCategoriaChange={setCategoria}
            onMonedaChange={setMoneda}
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
          />
          <p className="mt-2 text-xs text-text-dim">{filtradas.length} cuentas</p>
        </div>

        <div className="overflow-y-auto p-4">
          {cargando ? (
            <div className="p-8 text-center text-sm text-text-dim">Cargando...</div>
          ) : filtradas.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-dim">No hay cuentas que coincidan.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtradas.map((c) => {
                const monedaCuenta = esUSD(c.tipo) ? "USD" : "ARS";
                return (
                  <div key={c.id} className="rounded-xl border border-border bg-surface-hover/30 p-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {monedaCuenta === "USD" ? "Pesos USD" : "Pesos ARS"}
                      </span>
                      {c.alias && (
                        <button
                          onClick={() => copiarAlias(c.alias!)}
                          className="rounded p-1 text-text-dim hover:bg-surface-hover hover:text-text"
                          title="Copiar alias"
                        >
                          <Copy size={13} />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-text">{c.nombre}</p>
                    {(c.banco || c.titular) && (
                      <p className="text-xs text-text-dim">{[c.banco, c.titular].filter(Boolean).join(" · ")}</p>
                    )}
                    <p className="mt-2 text-xl font-bold text-primary">
                      {formatCurrency(c.saldoActual, monedaCuenta)}
                    </p>
                    {c.alias && <p className="mt-1 text-xs text-text-dim">{c.alias}</p>}
                    {c.limiteMensualIngresos && (
                      <BarraLimiteMensual saldoActual={c.saldoActual} limite={c.limiteMensualIngresos} tipo={c.tipo} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}