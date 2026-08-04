"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

// Interface según el esquema de Prisma
interface Producto {
  id: string;
  nombre: string;
  marca?: { nombre: string };
  stockActual: number;
  precioCosto: number;
  precioVenta: number;
  precioMayorista?: number | null;
  monedaPrecio: "USD" | "ARS";
  activo: boolean;
}

// Datos de prueba (pueden reemplazarse por la llamada a la API/Prisma)
const MOCK_PRODUCTOS: Producto[] = [
  {
    id: "PROD-1",
    nombre: "Oud Wood Intense",
    marca: { nombre: "Tom Ford" },
    stockActual: 24,
    precioCosto: 180,
    precioVenta: 260,
    precioMayorista: 230,
    monedaPrecio: "USD",
    activo: true,
  },
  {
    id: "PROD-2",
    nombre: "Baccarat Rouge 540",
    marca: { nombre: "Maison Francis Kurkdjian" },
    stockActual: 12,
    precioCosto: 210,
    precioVenta: 310,
    precioMayorista: 280,
    monedaPrecio: "USD",
    activo: true,
  },
  {
    id: "PROD-3",
    nombre: "Aventus",
    marca: { nombre: "Creed" },
    stockActual: 5,
    precioCosto: 250,
    precioVenta: 380,
    precioMayorista: 340,
    monedaPrecio: "USD",
    activo: true,
  },
  {
    id: "PROD-4",
    nombre: "Sauvage Elixir",
    marca: { nombre: "Dior" },
    stockActual: 30,
    precioCosto: 110,
    precioVenta: 165,
    precioMayorista: 145,
    monedaPrecio: "USD",
    activo: true,
  },
];

// Cotización global para convertir productos valuados en USD
const COTIZACION_USD = 1200; 

export default function ProductosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 15;

  // 1. Filtrar productos por nombre o marca
  const productosFiltrados = useMemo(() => {
    return MOCK_PRODUCTOS.filter(
      (p) =>
        p.activo &&
        (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.marca?.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    );
  }, [busqueda]);

  // 2. Cálculos para las 3 Tarjetas Resumen (ARS y USD)
  const resumen = useMemo(() => {
    let costoTotalUSD = 0;
    let ventaTotalUSD = 0;

    productosFiltrados.forEach((p) => {
      // Normalizar montos a USD para consolidar los totales
      const costoEnUSD =
        p.monedaPrecio === "USD" ? p.precioCosto : p.precioCosto / COTIZACION_USD;
      const ventaEnUSD =
        p.monedaPrecio === "USD" ? p.precioVenta : p.precioVenta / COTIZACION_USD;

      costoTotalUSD += costoEnUSD * p.stockActual;
      ventaTotalUSD += ventaEnUSD * p.stockActual;
    });

    const gananciaTotalUSD = ventaTotalUSD - costoTotalUSD;

    return {
      costoUSD: costoTotalUSD,
      costoARS: costoTotalUSD * COTIZACION_USD,
      ventaUSD: ventaTotalUSD,
      ventaARS: ventaTotalUSD * COTIZACION_USD,
      gananciaUSD: gananciaTotalUSD,
      gananciaARS: gananciaTotalUSD * COTIZACION_USD,
    };
  }, [productosFiltrados]);

  // 3. Paginación para alto volumen (~500+ items)
  const totalPaginas = Math.ceil(productosFiltrados.length / elementosPorPagina) || 1;
  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return productosFiltrados.slice(inicio, inicio + elementosPorPagina);
  }, [productosFiltrados, paginaActual]);

  // Formateador de moneda
  const formatMoney = (amount: number, currency: "USD" | "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">
            Catálogo de Productos
          </h1>
          <p className="text-sm text-text-dim">
            Gestión de inventario y valores de venta
          </p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
          + Nuevo Producto
        </button>
      </div>

      {/* 3 Tarjetas Resumen (ARS y USD) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Tarjeta 1: Stock a Costo */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">
            Stock a Costo
          </p>
          <p className="mt-1 text-2xl font-semibold text-text">
            {formatMoney(resumen.costoARS, "ARS")}
          </p>
          <p className="mt-1 text-xs font-medium text-text-dim">
            {formatMoney(resumen.costoUSD, "USD")}
          </p>
        </div>

        {/* Tarjeta 2: Stock a Precio Venta */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">
            Stock a Precio Venta
          </p>
          <p className="mt-1 text-2xl font-semibold text-text">
            {formatMoney(resumen.ventaARS, "ARS")}
          </p>
          <p className="mt-1 text-xs font-medium text-text-dim">
            {formatMoney(resumen.ventaUSD, "USD")}
          </p>
        </div>

        {/* Tarjeta 3: Ganancia Potencial */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">
            Ganancia Potencial
          </p>
          <p className="mt-1 text-2xl font-semibold text-success">
            {formatMoney(resumen.gananciaARS, "ARS")}
          </p>
          <p className="mt-1 text-xs font-medium text-success/80">
            {formatMoney(resumen.gananciaUSD, "USD")}
          </p>
        </div>
      </div>

      {/* Tabla y Filtros */}
      <div className="rounded-xl border border-border bg-surface p-4">
        {/* Buscador */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1); // Reiniciar paginación al buscar
              }}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-primary focus:outline-none"
            />
          </div>
          <p className="text-xs text-text-dim">
            Mostrando {productosFiltrados.length} productos
          </p>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="pb-3 pr-4 font-medium">Producto</th>
                <th className="pb-3 pr-4 font-medium">Marca</th>
                <th className="pb-3 pr-4 font-medium">Stock</th>
                <th className="pb-3 pr-4 font-medium">Costo</th>
                <th className="pb-3 pr-4 font-medium">Venta</th>
                <th className="pb-3 pr-4 font-medium">% Ganancia</th>
                <th className="pb-3 pr-4 font-medium">Mayorista</th>
                <th className="pb-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosPaginados.length > 0 ? (
                productosPaginados.map((p) => {
                  // Cálculo de porcentaje de ganancia
                  const porcentajeGanancia =
                    p.precioCosto > 0
                      ? ((p.precioVenta - p.precioCosto) / p.precioCosto) * 100
                      : 0;

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-surface-hover/50"
                    >
                      <td className="py-3 pr-4 font-medium text-text">
                        {p.nombre}
                      </td>
                      <td className="py-3 pr-4 text-text-dim">
                        {p.marca?.nombre ?? "-"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "font-medium",
                            p.stockActual <= 5
                              ? "text-danger"
                              : "text-text"
                          )}
                        >
                          {p.stockActual} u.
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-text-dim">
                        {formatMoney(p.precioCosto, p.monedaPrecio)}
                      </td>
                      <td className="py-3 pr-4 font-medium text-text">
                        {formatMoney(p.precioVenta, p.monedaPrecio)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                          +{porcentajeGanancia.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-text-dim">
                        {p.precioMayorista
                          ? formatMoney(p.precioMayorista, p.monedaPrecio)
                          : "-"}
                      </td>
                      <td className="py-3">
                        <button className="text-text-dim hover:text-text">
                          ⋮
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-sm text-text-dim"
                  >
                    No se encontraron productos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-text-dim">
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((prev) => prev - 1)}
                className="rounded-md border border-border px-3 py-1 hover:bg-surface-hover disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((prev) => prev + 1)}
                className="rounded-md border border-border px-3 py-1 hover:bg-surface-hover disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}