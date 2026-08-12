"use client";

import { useEffect, useRef, useState } from "react";
import { simularFormulaDecant } from "@/lib/calculos/decants";
import { toUsd } from "@/lib/currency";
import { formatCurrency } from "@/lib/currency";
import type { ProductoBusquedaDTO } from "@/types/producto";
import type { OpcionPresentacion, Presentacion } from "@/types/decant";

interface Props {
  producto: ProductoBusquedaDTO;
  onElegir: (presentacion: Presentacion, precioArs: number, abrioFrascoCerrado: boolean) => void;
  onClose: () => void;
}

export function ModalPresentacion({ producto, onElegir, onClose }: Props) {
  const [opciones, setOpciones] = useState<OpcionPresentacion[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [abrioFrascoCerrado, setAbrioFrascoCerrado] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function calcular() {
      const res = await fetch("/api/configuracion");
      const config = await res.json();

      const opcionesCalculadas: OpcionPresentacion[] = [
        {
          presentacion: "FRASCO",
          etiqueta: "Frasco completo",
          precio: producto.monedaPrecio === "USD" ? producto.precioVenta * config.cotizacionUSD : producto.precioVenta,
          disponible: producto.stockActual > 0,
          motivoNoDisponible: producto.stockActual === 0 ? "Sin stock" : undefined,
        },
      ];

      // Decant 5ml
      if (producto.overrideDecant5ml != null) {
        opcionesCalculadas.push({
          presentacion: "DECANT_5ML",
          etiqueta: "Decant 5ml",
          precio: producto.overrideDecant5ml,
          disponible: true,
        });
      } else if (producto.contenidoMl && producto.contenidoMl > 0) {
        const precioTotalUSD = toUsd(producto.precioCosto, producto.monedaPrecio);
        const sim = simularFormulaDecant({
          mlPerfume: producto.contenidoMl,
          precioTotalUSD,
          cotizacionUSD: config.cotizacionUSD,
          costoEnvaseDecantARS: config.costoEnvaseDecantARS,
          multiplicadorInsumoDecant: config.multiplicadorInsumoDecant,
        });
        opcionesCalculadas.push({
          presentacion: "DECANT_5ML",
          etiqueta: "Decant 5ml",
          precio: sim.decant5ml.precioSugerido,
          disponible: true,
        });
      } else {
        opcionesCalculadas.push({
          presentacion: "DECANT_5ML",
          etiqueta: "Decant 5ml",
          precio: 0,
          disponible: false,
          motivoNoDisponible: "Precio no configurado (falta contenidoMl u override)",
        });
      }

      // Decant 10ml (misma lógica)
      if (producto.overrideDecant10ml != null) {
        opcionesCalculadas.push({
          presentacion: "DECANT_10ML",
          etiqueta: "Decant 10ml",
          precio: producto.overrideDecant10ml,
          disponible: true,
        });
      } else if (producto.contenidoMl && producto.contenidoMl > 0) {
        const precioTotalUSD = toUsd(producto.precioCosto, producto.monedaPrecio);
        const sim = simularFormulaDecant({
          mlPerfume: producto.contenidoMl,
          precioTotalUSD,
          cotizacionUSD: config.cotizacionUSD,
          costoEnvaseDecantARS: config.costoEnvaseDecantARS,
          multiplicadorInsumoDecant: config.multiplicadorInsumoDecant,
        });
        opcionesCalculadas.push({
          presentacion: "DECANT_10ML",
          etiqueta: "Decant 10ml",
          precio: sim.decant10ml.precioSugerido,
          disponible: true,
        });
      } else {
        opcionesCalculadas.push({
          presentacion: "DECANT_10ML",
          etiqueta: "Decant 10ml",
          precio: 0,
          disponible: false,
          motivoNoDisponible: "Precio no configurado (falta contenidoMl u override)",
        });
      }

      setOpciones(opcionesCalculadas);
    }
    calcular();
  }, [producto]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!opciones) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, opciones.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opcion = opciones[activeIndex];
        if (opcion.disponible) {
          onElegir(opcion.presentacion, opcion.precio, abrioFrascoCerrado);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [opciones, activeIndex, abrioFrascoCerrado, onElegir, onClose]);

  const esDecantElegido = opciones && opciones[activeIndex]?.presentacion !== "FRASCO";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div ref={contenedorRef} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text">{producto.nombre}</h3>
          <button onClick={onClose} className="text-text-dim hover:text-text" aria-label="Cerrar">
            ✕
          </button>
        </div>
        <p className="mt-0.5 text-xs text-text-dim">↑↓ navegar · Enter elegir</p>

        <div className="mt-3 rounded-lg bg-surface-hover px-3 py-2 text-xs text-text-dim">
          Stock: {producto.stockActual}
        </div>

        {!opciones && <div className="mt-4 py-6 text-center text-sm text-text-dim">Calculando precios...</div>}

        {opciones && (
          <div className="mt-3 space-y-2">
            {opciones.map((op, i) => (
              <button
                key={op.presentacion}
                type="button"
                disabled={!op.disponible}
                onClick={() => op.disponible && onElegir(op.presentacion, op.precio, abrioFrascoCerrado)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                  !op.disponible
                    ? "cursor-not-allowed border-border opacity-40"
                    : i === activeIndex
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-surface-hover"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-text">{op.etiqueta}</p>
                  <p className="text-xs text-text-dim">
                    {op.presentacion === "FRASCO"
                      ? `${producto.stockActual} disponibles`
                      : op.disponible
                        ? "Venta de decant"
                        : op.motivoNoDisponible}
                  </p>
                </div>
                {op.disponible && <span className="font-bold text-primary">{formatCurrency(op.precio, "ARS")}</span>}
              </button>
            ))}
          </div>
        )}

        <label
          className={`mt-4 flex items-center gap-2 rounded-lg p-2 text-sm ${
            esDecantElegido ? "text-text" : "text-text-dim opacity-50"
          }`}
        >
          <input
            type="checkbox"
            disabled={!esDecantElegido}
            checked={abrioFrascoCerrado}
            onChange={(e) => setAbrioFrascoCerrado(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span>
            Abrí un frasco cerrado para esta venta
            <span className="block text-xs text-text-dim">Descuenta 1 unidad del stock</span>
          </span>
        </label>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-border py-2 text-sm font-medium text-text-dim hover:bg-surface-hover"
        >
          Cancelar <span className="text-text-dim/60">(Esc)</span>
        </button>
      </div>
    </div>
  );
}