"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { ProductoFormModal, type ProductoFormData } from "@/components/productos/producto-form-modal";
import { FormulaDecantModal } from "@/components/productos/formula-decant-modal";
import { PdfGeneratorModal } from "@/components/productos/pdf-generator-modal";
import { FileText, Search } from "lucide-react";
import Link from "next/link";

interface Producto {
  id: string;
  nombre: string;
  codigoBarras?: string | null;
  ubicacionDeposito?: string | null;
  fotoUrl?: string | null;
  contenidoMl?: number | null;
  marca?: { nombre: string } | null;
  marcaId?: number | null;
  categoriaId?: number | null;
  stockActual: number;
  stockMinimo?: number;
  destacado?: boolean;
  precioCosto: number;
  precioVenta: number;
  precioMayorista?: number | null;
  precioOferta?: number | null;
  monedaPrecio: "USD" | "ARS";
  overrideDecant5ml?: number | null;
  overrideDecant10ml?: number | null;
  seVendePorDecant?: boolean;
  activo: boolean;
}

const COTIZACION_USD = 1200;

export default function ProductosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 15;

  // Estados para manejo del Modal y la API
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState<ProductoFormData | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Fórmula Decant
  const [isFormulaDecantOpen, setIsFormulaDecantOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [configDecant, setConfigDecant] = useState({
    costoEnvaseDecantARS: 1500,
    multiplicadorInsumoDecant: 2.5,
    divisorFrascoDecant: 9,
    offsetDecant5mlARS: 200,
    cotizacionUSD: 1200,
  });

  useEffect(() => {
    fetch("/api/configuracion")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setConfigDecant({
            costoEnvaseDecantARS: data.costoEnvaseDecantARS ?? 1500,
            multiplicadorInsumoDecant: data.multiplicadorInsumoDecant ?? 2.5,
            divisorFrascoDecant: data.divisorFrascoDecant ?? 9,
            offsetDecant5mlARS: data.offsetDecant5mlARS ?? 200,
            cotizacionUSD: data.cotizacionUSD ?? 1200,
          });
        }
      })
      .catch((error) => console.error("Error al cargar configuración:", error));
  }, []);

  // Cargar productos desde la API
  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      const res = await fetch("/api/productos");
      if (res.ok) {
        const data = await res.json();
        // Si la API devuelve un objeto paginado { items, total }, tomamos items
        setProductos(data.items || data);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // 1. Filtrar productos por nombre o marca
  const productosFiltrados = useMemo(() => {
    return productos.filter(
      (p) =>
        p.activo &&
        (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.marca?.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    );
  }, [busqueda, productos]);

  // 2. Cálculos para las 3 Tarjetas Resumen (ARS y USD)
  const resumen = useMemo(() => {
    let costoTotalUSD = 0;
    let ventaTotalUSD = 0;

    productosFiltrados.forEach((p) => {
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

  // 3. Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / elementosPorPagina) || 1;
  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return productosFiltrados.slice(inicio, inicio + elementosPorPagina);
  }, [productosFiltrados, paginaActual]);

  const formatMoney = (amount: number, currency: "USD" | "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleAbrirCrear = () => {
    setProductoEditar(null);
    setIsModalOpen(true);
  };

  function mapProductoToFormData(producto: Producto): ProductoFormData {
    return {
      id: String(producto.id),
      nombre: producto.nombre ?? "",
      codigoBarras: producto.codigoBarras ?? "",
      ubicacion: producto.ubicacionDeposito ?? "",
      marcaId: producto.marcaId ? String(producto.marcaId) : "",
      categoriaId: producto.categoriaId ? String(producto.categoriaId) : "",
      contenidoMl: producto.contenidoMl ?? "",
      stockActual: producto.stockActual ?? "",
      stockMinimo: producto.stockMinimo ?? "",
      destacado: producto.destacado ?? false,
      monedaPrecio: producto.monedaPrecio ?? "USD",
      precioCosto: producto.precioCosto ?? "",
      precioVenta: producto.precioVenta ?? "",
      precioMayorista: producto.precioMayorista ?? "",
      precioOferta: producto.precioOferta ?? "",
      esDecant: producto.seVendePorDecant ?? false,
      overrideDecant5ml: producto.overrideDecant5ml ?? "",
      overrideDecant10ml: producto.overrideDecant10ml ?? "",
      fotoUrl: producto.fotoUrl ?? "",
    };
  };

  const handleAbrirEditar = (producto: Producto) => {
    setProductoEditar(mapProductoToFormData(producto));
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#191c1e] sm:text-2xl">
            Catálogo de Productos
          </h1>
          <p className="text-sm text-[#45464f]">
            Gestión de inventario y valores de venta
          </p>
        </div>

        {/* Acciones: en mobile ocupan todo el ancho en grilla de 2 columnas, en desktop en fila */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#c5c6d0] bg-white px-4 py-2 text-sm font-medium text-[#45464f] hover:bg-[#eceef0] cursor-pointer"
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">Generar PDF</span>
          </button>
          <Link
            href="/productos/actualizar-precios"
            className="inline-flex items-center justify-center rounded-lg bg-[#021541] px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90 cursor-pointer"
          >
            + Actualizar Precios
          </Link>
          <button
            type="button"
            onClick={() => setIsFormulaDecantOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-[#021541] px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
          >
            Fórmula Decant
          </button>
          <button
            type="button"
            onClick={handleAbrirCrear}
            className="inline-flex items-center justify-center rounded-lg bg-[#021541] px-4 py-2 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#45464f]">
            Stock a Costo
          </p>
          <p className="mt-1 truncate text-xl font-semibold text-[#191c1e] sm:text-2xl">
            {formatMoney(resumen.costoARS, "ARS")}
          </p>
          <p className="mt-1 truncate text-xs font-medium text-[#45464f]">
            {formatMoney(resumen.costoUSD, "USD")}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#45464f]">
            Stock a Precio Venta
          </p>
          <p className="mt-1 truncate text-xl font-semibold text-[#191c1e] sm:text-2xl">
            {formatMoney(resumen.ventaARS, "ARS")}
          </p>
          <p className="mt-1 text-xs font-medium text-[#45464f]">
            {formatMoney(resumen.ventaUSD, "USD")}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#45464f]">
            Ganancia Potencial
          </p>
          <p className="mt-1 truncate text-xl font-semibold text-[#1e7d38] sm:text-2xl">
            {formatMoney(resumen.gananciaARS, "ARS")}
          </p>
          <p className="mt-1 truncate text-xs font-medium text-[#1e7d38] opacity-80">
            {formatMoney(resumen.gananciaUSD, "USD")}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#45464f]" />
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full rounded-lg border border-[#c5c6d0] bg-white py-2 pl-9 pr-3 text-sm text-[#191c1e] placeholder:text-[#45464f] focus:outline-none focus:ring-1 focus:ring-[#021541]"
            />
          </div>
          <p className="text-xs text-[#45464f]">
            Mostrando {productosFiltrados.length} productos
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        {cargando ? (
          <p className="p-8 text-center text-sm text-[#45464f]">Cargando...</p>
        ) : productosPaginados.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#45464f]">
            No se encontraron productos que coincidan con la búsqueda.
          </p>
        ) : (
          <>
            {/* Desktop / tablet: tabla */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-[#F1F5F9]">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-[#45464f]">
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Marca</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Costo</th>
                    <th className="px-4 py-3">Venta</th>
                    <th className="px-4 py-3">% Ganancia</th>
                    <th className="px-4 py-3">Mayorista</th>
                    <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productosPaginados.map((p) => {
                    const porcentajeGanancia =
                      p.precioCosto > 0
                        ? ((p.precioVenta - p.precioCosto) / p.precioCosto) * 100
                        : 0;

                    return (
                      <tr key={p.id} className="border-t border-[#E2E8F0]">
                        <td className="px-4 py-3 font-medium text-[#191c1e]">
                          {p.nombre}
                        </td>
                        <td className="px-4 py-3 text-[#45464f]">
                          {p.marca?.nombre ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "font-medium",
                              p.stockActual <= 5 ? "text-[#ba1a1a]" : "text-[#191c1e]"
                            )}
                          >
                            {p.stockActual} u.
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#45464f]">
                          {formatMoney(p.precioCosto, p.monedaPrecio)}
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-[#191c1e]">
                          {formatMoney(p.precioVenta, p.monedaPrecio)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[#e1f2e6] px-2.5 py-1 text-xs font-semibold text-[#1e7d38]">
                            +{porcentajeGanancia.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#45464f]">
                          {p.precioMayorista
                            ? formatMoney(p.precioMayorista, p.monedaPrecio)
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleAbrirEditar(p)}
                            className="text-[#45464f] hover:text-[#021541]"
                          >
                            ⋮
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: tarjetas */}
            <div className="divide-y divide-[#E2E8F0] md:hidden">
              {productosPaginados.map((p) => {
                const porcentajeGanancia =
                  p.precioCosto > 0
                    ? ((p.precioVenta - p.precioCosto) / p.precioCosto) * 100
                    : 0;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleAbrirEditar(p)}
                    className="w-full p-4 text-left active:bg-[#eceef0]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#191c1e]">{p.nombre}</p>
                        <p className="truncate text-xs text-[#45464f]">
                          {p.marca?.nombre ?? "-"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#e1f2e6] px-2.5 py-1 text-xs font-semibold text-[#1e7d38]">
                        +{porcentajeGanancia.toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                      <div>
                        <p className="text-xs text-[#45464f]">Stock</p>
                        <p
                          className={cn(
                            "font-medium",
                            p.stockActual <= 5 ? "text-[#ba1a1a]" : "text-[#191c1e]"
                          )}
                        >
                          {p.stockActual} u.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#45464f]">Costo</p>
                        <p className="font-mono text-[#45464f]">
                          {formatMoney(p.precioCosto, p.monedaPrecio)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#45464f]">Venta</p>
                        <p className="font-mono font-medium text-[#191c1e]">
                          {formatMoney(p.precioVenta, p.monedaPrecio)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#45464f]">Mayorista</p>
                        <p className="font-mono text-[#45464f]">
                          {p.precioMayorista
                            ? formatMoney(p.precioMayorista, p.monedaPrecio)
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Paginación */}
      {productosFiltrados.length > 0 && (
        <div className="flex flex-col gap-2 text-sm text-[#45464f] sm:flex-row sm:items-center sm:justify-between">
          <span>
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((prev) => prev - 1)}
              className="px-3 py-1.5 rounded-lg border border-[#c5c6d0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eceef0]"
            >
              Anterior
            </button>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#c5c6d0] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eceef0]"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal para Crear / Editar Producto */}
      <ProductoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productoEditar={productoEditar}
        onSuccess={cargarProductos}
      />

      {/* Modal para Fórmula Decant */}
      <FormulaDecantModal
        isOpen={isFormulaDecantOpen}
        onClose={() => setIsFormulaDecantOpen(false)}
        costoEnvaseDecantARSInicial={configDecant.costoEnvaseDecantARS}
        multiplicadorInsumoDecantInicial={configDecant.multiplicadorInsumoDecant}
        divisorFrascoDecantInicial={configDecant.divisorFrascoDecant}
        offsetDecant5mlARSInicial={configDecant.offsetDecant5mlARS}
        cotizacionUSD={configDecant.cotizacionUSD}
      />

      <PdfGeneratorModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
}