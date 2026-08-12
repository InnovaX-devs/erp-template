"use client";

import { useState } from "react";
import { Minus, Plus, Pencil, Trash2, Check } from "lucide-react";
import type { ItemCarrito, TipoPrecioLinea } from "@/types/item-carrito";
import { formatCurrency } from "@/lib/currency";

interface Props {
  items: ItemCarrito[];
  onCambiarCantidad: (id: string, cantidad: number) => void;
  onCambiarPrecio: (id: string, precioArs: number) => void;
  onCambiarTipoPrecio: (id: string, tipo: TipoPrecioLinea) => void;
  onEliminar: (id: string) => void;
}

interface FilaProps {
  item: ItemCarrito;
  onCambiarCantidad: (id: string, cantidad: number) => void;
  onCambiarPrecio: (id: string, precioArs: number) => void;
  onCambiarTipoPrecio: (id: string, tipo: TipoPrecioLinea) => void;
  onEliminar: (id: string) => void;
}

export function TablaCarrito({
  items,
  onCambiarCantidad,
  onCambiarPrecio,
  onCambiarTipoPrecio,
  onEliminar,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-dim">
        Carrito vacío. Buscá un producto para agregarlo.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary text-left text-xs font-semibold uppercase tracking-wider text-white">
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3 text-center">Cantidad</th>
            <th className="px-4 py-3 text-right">Precio unit.</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <FilaCarrito
              key={item.id}
              item={item}
              onCambiarCantidad={onCambiarCantidad}
              onCambiarPrecio={onCambiarPrecio}
              onCambiarTipoPrecio={onCambiarTipoPrecio}
              onEliminar={onEliminar}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilaCarrito({
  item,
  onCambiarCantidad,
  onCambiarPrecio,
  onCambiarTipoPrecio,
  onEliminar,
}: FilaProps) {
  const [editandoPrecio, setEditandoPrecio] = useState(false);
  const [precioTemp, setPrecioTemp] = useState(String(item.precioUnitarioArs));

  const total = item.cantidad * item.precioUnitarioArs;

  function confirmarPrecio() {
    const valor = Number(precioTemp);
    if (!Number.isNaN(valor) && valor >= 0) {
      onCambiarPrecio(item.id, valor);
    } else {
      setPrecioTemp(String(item.precioUnitarioArs));
    }
    setEditandoPrecio(false);
  }

  return (
    <tr className="border-b border-border bg-surface last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-border text-xs font-medium">
            <button
              type="button"
              onClick={() => onCambiarTipoPrecio(item.id, "MINORISTA")}
              className={`px-2 py-1 transition-colors ${
                item.tipoPrecio === "MINORISTA" ? "bg-primary text-white" : "bg-surface text-text-dim hover:bg-surface-hover"
              }`}
            >
              Minorista
            </button>
            <button
              type="button"
              onClick={() => onCambiarTipoPrecio(item.id, "MAYORISTA")}
              className={`px-2 py-1 transition-colors ${
                item.tipoPrecio === "MAYORISTA" ? "bg-warning text-white" : "bg-surface text-text-dim hover:bg-surface-hover"
              }`}
            >
              Mayorista
            </button>
          </div>
          <span className="font-medium text-text">
            {item.producto.nombre}
            {item.presentacion !== "FRASCO" && (
              <span className="ml-1.5 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                {item.presentacion === "DECANT_5ML" ? "5ml" : "10ml"}
              </span>
            )}
          </span>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onCambiarCantidad(item.id, Math.max(1, item.cantidad - 1))}
            className="rounded-md border border-border p-1 text-text-dim hover:bg-surface-hover hover:text-text"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center font-medium text-text">{item.cantidad}</span>
          <button
            type="button"
            onClick={() => onCambiarCantidad(item.id, item.cantidad + 1)}
            disabled={item.cantidad >= item.producto.stockActual}
            className="rounded-md border border-border p-1 text-text-dim hover:bg-surface-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
      </td>

      <td className="px-4 py-3 text-right">
        {editandoPrecio ? (
          <div className="flex items-center justify-end gap-1">
            <input
              autoFocus
              type="number"
              step="0.01"
              value={precioTemp}
              onChange={(e) => setPrecioTemp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmarPrecio()}
              onBlur={confirmarPrecio}
              className="w-28 rounded-md border border-primary bg-surface px-2 py-1 text-right text-sm text-text focus:outline-none"
            />
            <button type="button" onClick={confirmarPrecio} className="text-success">
              <Check size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setPrecioTemp(String(item.precioUnitarioArs));
              setEditandoPrecio(true);
            }}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <Pencil size={12} />
            {formatCurrency(item.precioUnitarioArs, "ARS")}
          </button>
        )}
      </td>

      <td className="px-4 py-3 text-right font-semibold text-text">
        {formatCurrency(total, "ARS")}
      </td>

      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => onEliminar(item.id)}
          className="rounded-lg p-1.5 text-text-dim hover:bg-danger/10 hover:text-danger"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}