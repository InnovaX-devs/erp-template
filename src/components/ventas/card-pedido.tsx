"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Package, DollarSign, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { marcarArmado, marcarRetirado } from "@/app/(dashboard)/ventas/actions";
import { ModalCobrarPedido } from "./modal-cobrar-pedido";
import type { PedidoListItem } from "@/types/venta";

const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

interface Props {
  pedido: PedidoListItem;
  onCambio: () => void;
}

export function CardPedido({ pedido, onCambio }: Props) {
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);

  async function handleArmado() {
    setProcesando(true);
    const resultado = await marcarArmado(pedido.id);
    setProcesando(false);
    if (!resultado.success) {
      toast.error(resultado.error);
      return;
    }
    toast.success(`Pedido #${pedido.id} armado`);
    onCambio();
  }

  async function handleRetirado() {
    setProcesando(true);
    const resultado = await marcarRetirado(pedido.id);
    setProcesando(false);
    if (!resultado.success) {
      toast.error(resultado.error);
      return;
    }
    toast.success(`Pedido #${pedido.id} retirado`);
    onCambio();
  }

  const estaPagado = pedido.estadoPago === "PAGADA";

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-text-dim">#{pedido.id}</p>
          <p className="text-sm font-semibold text-text">{pedido.clienteNombre ?? "Sin cliente"}</p>
        </div>
        <p className="text-xs text-text-dim">{formatoFecha.format(new Date(pedido.fecha))}</p>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-text">{formatCurrency(pedido.totalARS, "ARS")}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              estaPagado ? "bg-success/10 text-success" : "bg-amber/10 text-amber"
            }`}
          >
            {estaPagado ? "Pagado" : "Sin cobrar"}
          </span>
        </div>

        <div className="flex shrink-0 gap-1">
          {!pedido.armado && (
            <button
              type="button"
              onClick={handleArmado}
              disabled={procesando}
              className="flex items-center gap-1 rounded-full bg-amber/10 px-2.5 py-1 text-xs font-medium text-amber hover:bg-amber/20 disabled:opacity-50"
            >
              <Package size={11} /> Armado
            </button>
          )}

          {!estaPagado && (
            <button
              type="button"
              onClick={() => setModalCobroAbierto(true)}
              className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success hover:bg-success/20"
            >
              <DollarSign size={11} /> Cobrar
            </button>
          )}

          {pedido.armado && !pedido.retirado && (
            <button
              type="button"
              onClick={handleRetirado}
              disabled={procesando}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
            >
              <CheckCircle2 size={11} /> Retirado
            </button>
          )}
        </div>
      </div>

      {modalCobroAbierto && (
        <ModalCobrarPedido
          pedido={pedido}
          tieneCliente={pedido.clienteNombre != null}
          onClose={() => setModalCobroAbierto(false)}
          onCobrado={onCambio}
        />
      )}
    </div>
  );
}