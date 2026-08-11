"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import BuscadorProducto from "./BuscadorProducto";
import BuscadorCliente from "./BuscadorCliente";
import ItemsPresupuestoTable from "./ItemsPresupuestoTable";
import { crearPresupuesto } from "./actions";
import { calcularFechaVencimiento, calcularTotalPresupuesto } from "@/lib/presupuestos";
import { toArs } from "@/lib/currency";
import type { ItemPresupuestoLocal, ProductoBusqueda } from "./types";
import type { ClienteBasico } from "@/components/clientes/ClienteForm";

const VIGENCIAS = [7, 15, 30] as const;

export default function PresupuestoForm() {
  const router = useRouter();

  const [cliente, setCliente] = useState<ClienteBasico | null>(null);
  const [tipoPrecio, setTipoPrecio] = useState<"MINORISTA" | "MAYORISTA">("MINORISTA");
  const [items, setItems] = useState<ItemPresupuestoLocal[]>([]);
  const [vigenciaDias, setVigenciaDias] = useState<number>(15);
  const [observaciones, setObservaciones] = useState("");
  const [mostrarDescuento, setMostrarDescuento] = useState(false);
  const [descuentoMonto, setDescuentoMonto] = useState<number | null>(null);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fechaVencimiento = useMemo(
    () => calcularFechaVencimiento(new Date(), vigenciaDias),
    [vigenciaDias]
  );

  const total = useMemo(
    () => calcularTotalPresupuesto(items, descuentoMonto, descuentoPorcentaje),
    [items, descuentoMonto, descuentoPorcentaje]
  );

  function agregarProducto(producto: ProductoBusqueda) {
    const precioBaseOriginal =
      tipoPrecio === "MAYORISTA" ? producto.precioMayorista ?? producto.precioVenta : producto.precioVenta;

    const precioUnitario = toArs(precioBaseOriginal, producto.monedaPrecio);

    setItems((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        productoId: producto.id,
        descripcion: producto.nombre,
        presentacion: "FRASCO",
        tipoPrecio,
        cantidad: 1,
        precioUnitario,
      },
    ]);
  }

  function cambiarCantidad(key: string, cantidad: number) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, cantidad: Math.max(1, cantidad) } : i)));
  }

  function cambiarPrecio(key: string, precio: number) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, precioUnitario: Math.max(0, precio) } : i)));
  }

  function quitarItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  async function handleGuardar() {
    setError(null);
    setGuardando(true);

    const res = await crearPresupuesto({
      clienteId: cliente?.id ?? null,
      vigenciaDias,
      observaciones: observaciones.trim() || null,
      descuentoMonto,
      descuentoPorcentaje,
      items,
    });

    setGuardando(false);

    if (!res.success) {
      setError(res.error);
      return;
    }

    router.push("/presupuestos");
    router.refresh();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 bg-white border-b border-[#e2e8f0]">
        <BuscadorCliente clienteSeleccionado={cliente} onSeleccionar={setCliente} />

        <BuscadorProducto tipoPrecio={tipoPrecio} onAgregar={agregarProducto} />

        <div className="flex rounded-lg overflow-hidden border border-[#021541]">
          <button
            type="button"
            onClick={() => setTipoPrecio("MINORISTA")}
            className={`px-4 py-2 text-sm font-medium ${
              tipoPrecio === "MINORISTA" ? "bg-[#021541] text-white" : "bg-white text-[#021541]"
            }`}
          >
            Min
          </button>
          <button
            type="button"
            onClick={() => setTipoPrecio("MAYORISTA")}
            className={`px-4 py-2 text-sm font-medium ${
              tipoPrecio === "MAYORISTA" ? "bg-[#021541] text-white" : "bg-white text-[#021541]"
            }`}
          >
            May
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl m-4 border border-[#e2e8f0] overflow-y-auto">
        <ItemsPresupuestoTable
          items={items}
          onCambiarCantidad={cambiarCantidad}
          onCambiarPrecio={cambiarPrecio}
          onQuitar={quitarItem}
        />
      </div>

      <div className="p-4 bg-[#eceef0] flex items-end gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#45464f] mb-1">
            Vigencia
          </p>
          <div className="flex gap-1">
            {VIGENCIAS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVigenciaDias(v)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  vigenciaDias === v ? "bg-[#021541] text-white" : "bg-white text-[#45464f] border border-[#c5c6d0]"
                }`}
              >
                {v}d
              </button>
            ))}
          </div>
          <p className="text-xs text-[#45464f] mt-1">
            Vence: {fechaVencimiento.toLocaleDateString("es-AR")}
          </p>
        </div>

        <input
          type="text"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Observaciones..."
          className="flex-1 px-3 py-2.5 border border-[#c5c6d0] rounded-lg text-sm bg-white"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMostrarDescuento((v) => !v)}
            className="px-4 py-2.5 rounded-full border border-[#c5c6d0] bg-white text-sm"
          >
            Descuento
          </button>
          {mostrarDescuento && (
            <div className="absolute bottom-full mb-2 right-0 bg-white border border-[#c5c6d0] rounded-lg p-3 shadow-lg w-48 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
                Monto ($)
              </label>
              <input
                type="number"
                value={descuentoMonto ?? ""}
                onChange={(e) => {
                  setDescuentoMonto(e.target.value ? Number(e.target.value) : null);
                  setDescuentoPorcentaje(null);
                }}
                className="w-full border border-[#c5c6d0] rounded px-2 py-1 text-sm"
              />
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
                Porcentaje (%)
              </label>
              <input
                type="number"
                value={descuentoPorcentaje ?? ""}
                onChange={(e) => {
                  setDescuentoPorcentaje(e.target.value ? Number(e.target.value) : null);
                  setDescuentoMonto(null);
                }}
                className="w-full border border-[#c5c6d0] rounded px-2 py-1 text-sm"
              />
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#45464f]">Total</p>
          <p className="text-2xl font-bold text-[#191c1e]">${total.toFixed(2)}</p>
        </div>

        <button
          type="button"
          disabled={items.length === 0 || guardando}
          onClick={handleGuardar}
          className="px-6 py-3 rounded-lg bg-[#021541] text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {guardando ? "Guardando..." : "Guardar Presupuesto"}
        </button>
      </div>

      {error && <p className="px-4 pb-4 text-sm text-[#ba1a1a]">{error}</p>}
    </div>
  );
}