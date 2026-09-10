"use client";

import { Pencil, Ban, X, CheckCircle, ImageIcon } from "lucide-react";
import { toArs, toUsd, formatCurrency } from "@/lib/currency";
import { calcularPreciosDecant } from "@/lib/calculos/decants";
import { cn } from "@/lib/cn";


function resolverPrecioDecant(
  producto: {
    precioCosto: number;
    monedaPrecio: "USD" | "ARS";
    overrideDecant5ml?: number | null;
    overrideDecant10ml?: number | null;
  },
  configuracion: ConfigDecant
): { precio5ml: number | null; precio10ml: number | null } {
  let precio5ml = producto.overrideDecant5ml ?? null;
  let precio10ml = producto.overrideDecant10ml ?? null;

  if (precio5ml !== null && precio10ml !== null) {
    return { precio5ml, precio10ml };
  }

  const {
    cotizacionUSD,
    costoEnvaseDecantARS,
    multiplicadorInsumoDecant,
    divisorFrascoDecant,
    offsetDecant5mlARS,
  } = configuracion;

  const puedeCalcular =
    costoEnvaseDecantARS != null &&
    multiplicadorInsumoDecant != null &&
    divisorFrascoDecant != null &&
    offsetDecant5mlARS != null &&
    cotizacionUSD > 0 &&
    producto.precioCosto > 0;

  if (puedeCalcular) {
    const costoFrascoUSD =
      producto.monedaPrecio === "USD"
        ? producto.precioCosto
        : producto.precioCosto / cotizacionUSD;

    try {
      const resultado = calcularPreciosDecant({
        costoFrascoUSD,
        cotizacionUSD,
        costoEnvaseDecantARS,
        multiplicadorInsumoDecant,
        divisorFrascoDecant,
        offsetDecant5mlARS,
      });

      if (precio5ml === null) precio5ml = resultado.decant5ml;
      if (precio10ml === null) precio10ml = resultado.decant10ml;
    } catch {
      // divisorFrascoDecant inválido: queda null ("N/D")
    }
  }

  return { precio5ml, precio10ml };
}

interface ProductoDetalle {
  id: string | number;
  nombre: string;
  fotoUrl?: string | null;
  contenidoMl?: number | null;
  marca?: { nombre: string } | null;
  categoria?: { nombre: string } | null;
  stockActual: number;
  stockMinimo?: number | null;
  precioCosto: number;
  precioVenta: number;
  precioMayorista?: number | null;
  monedaPrecio: "USD" | "ARS";
  overrideDecant5ml?: number | null;
  overrideDecant10ml?: number | null;
  seVendePorDecant?: boolean;
  activo: boolean;
}

interface ConfigDecant {
  cotizacionUSD: number;
  costoEnvaseDecantARS: number;
  multiplicadorInsumoDecant: number;
  divisorFrascoDecant: number;
  offsetDecant5mlARS: number;
  moduloDecantHabilitado?: boolean;
}

interface ProductoDetalleModalProps {
  isOpen: boolean;
  producto: ProductoDetalle | null;
  configDecant: ConfigDecant;
  onClose: () => void;
  onEditar: () => void;
  onDesactivar: () => void;
}

export function ProductoDetalleModal({
  isOpen,
  producto,
  configDecant,
  onClose,
  onEditar,
  onDesactivar,
}: ProductoDetalleModalProps) {
  if (!isOpen || !producto) return null;

  const cotizacion = configDecant.cotizacionUSD;

  const costo = {
    usd: toUsd(producto.precioCosto, producto.monedaPrecio, cotizacion),
    ars: toArs(producto.precioCosto, producto.monedaPrecio, cotizacion),
  };
  const venta = {
    usd: toUsd(producto.precioVenta, producto.monedaPrecio, cotizacion),
    ars: toArs(producto.precioVenta, producto.monedaPrecio, cotizacion),
  };
  const mayorista =
    producto.precioMayorista != null
      ? {
          usd: toUsd(producto.precioMayorista, producto.monedaPrecio, cotizacion),
          ars: toArs(producto.precioMayorista, producto.monedaPrecio, cotizacion),
        }
      : null;

  const margenVenta =
    producto.precioCosto > 0
      ? ((producto.precioVenta - producto.precioCosto) / producto.precioCosto) * 100
      : 0;
  const margenMayorista =
    mayorista && producto.precioCosto > 0
      ? ((producto.precioMayorista! - producto.precioCosto) / producto.precioCosto) * 100
      : null;

  const { precio5ml, precio10ml } = resolverPrecioDecant(producto, configDecant);

  const formatARS = (valor: number) =>
    valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative shrink-0 bg-[#021541] p-5 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
              {producto.fotoUrl ? (
                <img
                  src={producto.fotoUrl}
                  alt={producto.nombre}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-[#021541]/40">Sin foto</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{producto.nombre}</h2>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {producto.marca?.nombre && (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium">
                    {producto.marca.nombre}
                  </span>
                )}
                {producto.categoria?.nombre && (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium">
                    {producto.categoria.nombre}
                  </span>
                )}
                <span className="rounded-full bg-[#1e7d38] px-2 py-0.5 text-[11px] font-semibold">
                  {producto.monedaPrecio}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className={cn("grid gap-2", configDecant.moduloDecantHabilitado ? "grid-cols-3" : "grid-cols-2")}>
            <div className="rounded-xl bg-[#F0FDF4] p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[#45464f]">
                Stock actual
              </p>
              <p className="mt-1 text-lg font-bold text-[#1e7d38]">
                {producto.stockActual}
              </p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[#45464f]">
                Stock mín.
              </p>
              <p className="mt-1 text-lg font-bold text-[#191c1e]">
                {producto.stockMinimo ?? 0}
              </p>
            </div>
            {configDecant.moduloDecantHabilitado && (
              <div className="rounded-xl bg-[#F8FAFC] p-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-[#45464f]">
                  Volumen
                </p>
                <p className="mt-1 text-lg font-bold text-[#191c1e]">
                  {producto.contenidoMl ? `${producto.contenidoMl}ml` : "-"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0]">
            <div className="bg-[#021541] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
              Precios · {producto.monedaPrecio}
            </div>

            <div className="flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3">
              <span className="text-sm text-[#45464f]">Costo</span>
              <div className="text-right">
                <p className="font-semibold text-[#191c1e]">
                  {formatCurrency(costo.usd, "USD")}
                </p>
                <p className="text-xs text-[#a3aab5]">{formatCurrency(costo.ars, "ARS")}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
              <span className="text-sm font-medium text-[#021541]">Venta</span>
              <div className="text-right">
                <p className="font-bold text-[#021541]">{formatCurrency(venta.usd, "USD")}</p>
                <p className="text-xs text-[#5b6472]">{formatCurrency(venta.ars, "ARS")}</p>
              </div>
            </div>

            {mayorista && (
              <div className="flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#191c1e]">Mayorista</span>
                  <span className="rounded bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-bold text-[#a15c00]">
                    MAY
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1D4ED8]">
                    {formatCurrency(mayorista.usd, "USD")}
                  </p>
                  <p className="text-xs text-[#93B4F5]">{formatCurrency(mayorista.ars, "ARS")}</p>
                  {margenMayorista !== null && (
                    <p className="text-[11px] font-medium text-[#a15c00]">
                      Margen {margenMayorista.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F0FDF4] px-4 py-3">
              <span className="text-sm font-medium text-[#1e7d38]">Margen venta</span>
              <span className="text-base font-bold text-[#1e7d38]">
                {margenVenta.toFixed(2)}%
              </span>
            </div>
          </div>

          {producto.seVendePorDecant && (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#E2E8F0]">
              <div className="bg-[#5B21B6] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                Decants
              </div>
              <div className="flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EDE9FE] text-xs font-bold text-[#5B21B6]">
                    5
                  </span>
                  <span className="text-sm text-[#191c1e]">Decant 5ml</span>
                </div>
                <span className="font-semibold text-[#5B21B6]">
                  {precio5ml !== null ? formatARS(precio5ml) : "N/D"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EDE9FE] text-xs font-bold text-[#5B21B6]">
                    10
                  </span>
                  <span className="text-sm text-[#191c1e]">Decant 10ml</span>
                </div>
                <span className="font-semibold text-[#5B21B6]">
                  {precio10ml !== null ? formatARS(precio10ml) : "N/D"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 gap-2 border-t border-[#E2E8F0] p-4">
          <button
            type="button"
            onClick={onEditar}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#021541] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Pencil className="h-4 w-4" />
            Editar producto
          </button>
          <button
            type="button"
            onClick={onDesactivar}
            className={
              producto.activo
                ? "flex items-center justify-center gap-2 rounded-lg border border-[#f5c2c2] bg-[#fdecec] px-4 py-2.5 text-sm font-medium text-[#ba1a1a] hover:bg-[#f8d7d7]"
                : "flex items-center justify-center gap-2 rounded-lg border border-[#b7dfc0] bg-[#e7f8ec] px-4 py-2.5 text-sm font-medium text-[#1e7d38] hover:bg-[#d9f2df]"
            }
          >
            {producto.activo ? (
              <>
                <Ban className="h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Activar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}