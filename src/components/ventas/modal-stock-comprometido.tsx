"use client";

import { AlertTriangle } from "lucide-react";
import type { StockDisponibilidad } from "@/app/(dashboard)/ventas/actions";

interface Props {
  nombreProducto: string;
  stock: StockDisponibilidad;
  unidadesQueriaVender: number;
  onCancelar: () => void;
  onVenderIgual: () => void;
}

export function ModalStockComprometido({
  nombreProducto,
  stock,
  unidadesQueriaVender,
  onCancelar,
  onVenderIgual,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber/10 p-2">
            <AlertTriangle className="h-5 w-5 text-amber" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">Stock comprometido</h2>
            <p className="text-sm text-text-dim">{nombreProducto}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-text-dim">Stock físico</span>
            <span className="font-medium text-text">{stock.stockFisico}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber">Reservado en pedidos</span>
            <span className="font-medium text-amber">{stock.reservado}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-text-dim">Disponible</span>
            <span className="font-medium text-text">{stock.disponible}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-dim">Querés vender</span>
            <span className="font-medium text-danger">{unidadesQueriaVender}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-text-dim">
          Parte de este stock está reservado para pedidos pendientes. Si vendés ahora, es posible
          que no puedas completar esos pedidos.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-dim hover:bg-surface-hover"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onVenderIgual}
            className="rounded-lg bg-amber px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Vender igual
          </button>
        </div>
      </div>
    </div>
  );
}