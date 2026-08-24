"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { ProductoFormModal, type ProductoFormData } from "@/components/productos/producto-form-modal";
import { FormulaDecantModal } from "@/components/productos/formula-decant-modal";
import { PdfGeneratorModal } from "@/components/productos/pdf-generator-modal";
import { FileText, Search, SlidersHorizontal } from "lucide-react";
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

interface Marca {
  id: string | number;
  nombre: string;
}

interface Categoria {
  id: string | number;
  nombre: string;
}

const COTIZACION_USD = 1200;

type FiltroStock = "todos" | "sin_stock" | "stock_bajo";
type FiltroFoto = "todas" | "con_foto" | "sin_foto";
type FiltroEstado = "activos" | "inactivos" | "todos";
type OrdenarPor =
  | ""
  | "nombre_asc"
  | "nombre_desc"
  | "stock_asc"
  | "stock_desc"
  | "ganancia_asc"
  | "ganancia_desc";

export default function ProductosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 15;

  // Estados para manejo del Modal y la API
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState<ProductoFormData | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para filtros auxiliares (marca / categoría)
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Estados del panel de filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroMarcaId, setFiltroMarcaId] = useState("");
  const [filtroCategoriaId, setFiltroCategoriaId] = useState("");
  const [filtroStock, setFiltroStock] = useState<FiltroStock>("todos");
  const [filtroFoto, setFiltroFoto] = useState<FiltroFoto>("todas");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("activos");
  const [ordenarPor, setOrdenarPor] = useState<OrdenarPor>("");

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

  // Cargar marcas y categorías para los selects de filtro
  useEffect(() => {
    Promise.all([fetch("/api/marcas"), fetch("/api/categorias")])
      .then(async ([resMarcas, resCategorias]) => {
        if (resMarcas.ok) {
          const dataM = await resMarcas.json();
          setMarcas(Array.isArray(dataM) ? dataM : dataM.items || []);
        }
        if (resCategorias.ok) {
          const dataC = await resCategorias.json();
          setCategorias(Array.isArray(dataC) ? dataC : dataC.items || []);
        }
      })
      .catch((error) => console.error("Error al cargar marcas/categorías:", error));
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

  // Reiniciar a la página 1 cuando cambia cualquier filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroMarcaId, filtroCategoriaId, filtroStock, filtroFoto, filtroEstado, ordenarPor]);

  // 1. Filtrar por búsqueda de texto (nombre o marca)
  const productosBusqueda = useMemo(() => {
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.marca?.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [busqueda, productos]);

  // Conteos para los accesos rápidos (sobre productos activos + búsqueda, sin aplicar filtro de stock)
  const conteoSinStock = useMemo(
    () => productosBusqueda.filter((p) => p.activo && p.stockActual <= 0).length,
    [productosBusqueda]
  );
  // Ahora
  const conteoStockBajo = useMemo(
    () =>
      productosBusqueda.filter(
        (p) => p.activo && p.stockActual > 0 && p.stockActual <= 5
      ).length,
    [productosBusqueda]
  );

  // 2. Aplicar filtros del panel + orden
  const productosFiltrados = useMemo(() => {
    let resultado = productosBusqueda.filter((p) => {
      if (filtroEstado === "activos" && !p.activo) return false;
      if (filtroEstado === "inactivos" && p.activo) return false;

      if (filtroMarcaId && String(p.marcaId ?? "") !== filtroMarcaId) return false;
      if (filtroCategoriaId && String(p.categoriaId ?? "") !== filtroCategoriaId) return false;

      if (filtroStock === "sin_stock" && p.stockActual > 0) return false;
      if (
        filtroStock === "stock_bajo" &&
        !(p.stockActual > 0 && p.stockActual <= 5)
      )
        return false;

      if (filtroFoto === "con_foto" && !p.fotoUrl) return false;
      if (filtroFoto === "sin_foto" && p.fotoUrl) return false;

      return true;
    });

    if (ordenarPor) {
      resultado = [...resultado].sort((a, b) => {
        switch (ordenarPor) {
          case "nombre_asc":
            return a.nombre.localeCompare(b.nombre);
          case "nombre_desc":
            return b.nombre.localeCompare(a.nombre);
          case "stock_asc":
            return a.stockActual - b.stockActual;
          case "stock_desc":
            return b.stockActual - a.stockActual;
          case "ganancia_asc":
          case "ganancia_desc": {
            const gananciaA =
              a.precioCosto > 0 ? (a.precioVenta - a.precioCosto) / a.precioCosto : 0;
            const gananciaB =
              b.precioCosto > 0 ? (b.precioVenta - b.precioCosto) / b.precioCosto : 0;
            return ordenarPor === "ganancia_asc" ? gananciaA - gananciaB : gananciaB - gananciaA;
          }
          default:
            return 0;
        }
      });
    }

    return resultado;
  }, [
    productosBusqueda,
    filtroEstado,
    filtroMarcaId,
    filtroCategoriaId,
    filtroStock,
    filtroFoto,
    ordenarPor,
  ]);

  // Cantidad de filtros activos (para el badge del botón y "Limpiar filtros")
  const filtrosActivosCount = useMemo(() => {
    let count = 0;
    if (filtroMarcaId) count++;
    if (filtroCategoriaId) count++;
    if (filtroStock !== "todos") count++;
    if (filtroFoto !== "todas") count++;
    if (filtroEstado !== "activos") count++;
    if (ordenarPor) count++;
    return count;
  }, [filtroMarcaId, filtroCategoriaId, filtroStock, filtroFoto, filtroEstado, ordenarPor]);

  const limpiarFiltros = () => {
    setFiltroMarcaId("");
    setFiltroCategoriaId("");
    setFiltroStock("todos");
    setFiltroFoto("todas");
    setFiltroEstado("activos");
    setOrdenarPor("");
  };

  // 3. Cálculos para las 3 Tarjetas Resumen (ARS y USD) — sobre el resultado ya filtrado
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

  // 4. Paginación
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
    };
  }

  const handleAbrirEditar = (producto: Producto) => {
    setProductoEditar(mapProductoToFormData(producto));
    setIsModalOpen(true);
  };

  const inicioRango = productosFiltrados.length === 0 ? 0 : (paginaActual - 1) * elementosPorPagina + 1;
  const finRango = Math.min(paginaActual * elementosPorPagina, productosFiltrados.length);

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#45464f]">Stock a Costo</p>
          <p className="mt-1 text-xl font-semibold text-[#191c1e] sm:text-2xl">
            {formatMoney(resumen.costoARS, "ARS")}
          </p>
          <p className="mt-1 text-xs font-medium text-[#45464f]">
            {formatMoney(resumen.costoUSD, "USD")}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#45464f]">Stock a Precio Venta</p>
          <p className="mt-1 text-xl font-semibold text-[#191c1e] sm:text-2xl">
            {formatMoney(resumen.ventaARS, "ARS")}
          </p>
          <p className="mt-1 text-xs font-medium text-[#45464f]">
            {formatMoney(resumen.ventaUSD, "USD")}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#45464f]">Ganancia Potencial</p>
          <p className="mt-1 text-xl font-semibold text-[#1e7d38] sm:text-2xl">
            {formatMoney(resumen.gananciaARS, "ARS")}
          </p>
          <p className="mt-1 text-xs font-medium text-[#1e7d38] opacity-80">
            {formatMoney(resumen.gananciaUSD, "USD")}
          </p>
        </div>
      </div>

      {/* Búsqueda + Filtros */}
      <div className="space-y-3 rounded-2xl border border-[#E2E8F0] bg-white p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#45464f]" />
              <input
                type="text"
                placeholder="Buscar por nombre o marca..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full rounded-lg border border-[#c5c6d0] bg-white py-2 pl-9 pr-3 text-sm text-[#191c1e] placeholder:text-[#45464f] focus:outline-none focus:ring-1 focus:ring-[#021541]"
              />
            </div>

            <button
              type="button"
              onClick={() => setMostrarFiltros((prev) => !prev)}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                mostrarFiltros
                  ? "border-[#021541] bg-[#021541] text-white"
                  : "border-[#c5c6d0] bg-white text-[#45464f] hover:bg-[#eceef0]"
              )}
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              Filtros
              {filtrosActivosCount > 0 && (
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
                    mostrarFiltros ? "bg-white text-[#021541]" : "bg-[#021541] text-white"
                  )}
                >
                  {filtrosActivosCount}
                </span>
              )}
            </button>
          </div>

          <p className="text-xs text-[#45464f] sm:text-right">
            Mostrando {inicioRango}–{finRango} de {productosFiltrados.length} productos
          </p>
        </div>

        {/* Panel de filtros — solo visible si mostrarFiltros es true */}
        {mostrarFiltros && (
          <div className="space-y-3 border-t border-[#E2E8F0] pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div>
                <label className="block text-xs font-medium text-[#45464f]">Marca</label>
                <select
                  value={filtroMarcaId}
                  onChange={(e) => setFiltroMarcaId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#021541]"
                >
                  <option value="">Todas las marcas</option>
                  {marcas.map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#45464f]">Categoría</label>
                <select
                  value={filtroCategoriaId}
                  onChange={(e) => setFiltroCategoriaId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#021541]"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#45464f]">Stock</label>
                <select
                  value={filtroStock}
                  onChange={(e) => setFiltroStock(e.target.value as FiltroStock)}
                  className="mt-1 w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#021541]"
                >
                  <option value="todos">Todos</option>
                  <option value="sin_stock">Sin stock</option>
                  <option value="stock_bajo">Stock bajo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#45464f]">Foto</label>
                <select
                  value={filtroFoto}
                  onChange={(e) => setFiltroFoto(e.target.value as FiltroFoto)}
                  className="mt-1 w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#021541]"
                >
                  <option value="todas">Todas</option>
                  <option value="con_foto">Con foto</option>
                  <option value="sin_foto">Sin foto</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#45464f]">Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
                  className="mt-1 w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#021541]"
                >
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                  <option value="todos">Todos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#45464f]">Ordenar por</label>
                <select
                  value={ordenarPor}
                  onChange={(e) => setOrdenarPor(e.target.value as OrdenarPor)}
                  className="mt-1 w-full rounded-lg border border-[#c5c6d0] bg-white px-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:ring-1 focus:ring-[#021541]"
                >
                  <option value="">Sin ordenar</option>
                  <option value="nombre_asc">Nombre (A-Z)</option>
                  <option value="nombre_desc">Nombre (Z-A)</option>
                  <option value="stock_asc">Stock (menor a mayor)</option>
                  <option value="stock_desc">Stock (mayor a menor)</option>
                  <option value="ganancia_asc">% Ganancia (menor a mayor)</option>
                  <option value="ganancia_desc">% Ganancia (mayor a menor)</option>
                </select>
              </div>
            </div>

            {/* Acceso rápido por stock */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-medium uppercase tracking-wide text-[#45464f]">
                Acceso rápido:
              </span>
              <button
                type="button"
                onClick={() => setFiltroStock(filtroStock === "sin_stock" ? "todos" : "sin_stock")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filtroStock === "sin_stock"
                    ? "border-[#ba1a1a] bg-[#ba1a1a] text-white"
                    : "border-[#f5c2c2] bg-[#fdecec] text-[#ba1a1a] hover:bg-[#f8d7d7]"
                )}
              >
                Sin stock
                <span className="rounded-full bg-black/10 px-1.5">{conteoSinStock}</span>
              </button>
              <button
                type="button"
                onClick={() => setFiltroStock(filtroStock === "stock_bajo" ? "todos" : "stock_bajo")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filtroStock === "stock_bajo"
                    ? "border-[#a15c00] bg-[#a15c00] text-white"
                    : "border-[#f2dca3] bg-[#fdf3dc] text-[#a15c00] hover:bg-[#f9ecc7]"
                )}
              >
                Stock bajo
                <span className="rounded-full bg-black/10 px-1.5">{conteoStockBajo}</span>
              </button>

              {filtrosActivosCount > 0 && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="ml-auto text-xs font-medium text-[#021541] underline-offset-2 hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}
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
                        <td className="px-4 py-3 font-medium text-[#191c1e]">{p.nombre}</td>
                        <td className="px-4 py-3 text-[#45464f]">{p.marca?.nombre ?? "-"}</td>
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
                          {p.precioMayorista ? formatMoney(p.precioMayorista, p.monedaPrecio) : "-"}
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
                        <p className="truncate text-xs text-[#45464f]">{p.marca?.nombre ?? "-"}</p>
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
                          {p.precioMayorista ? formatMoney(p.precioMayorista, p.monedaPrecio) : "-"}
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

      <ProductoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productoEditar={productoEditar}
        onSuccess={cargarProductos}
      />

      <FormulaDecantModal
        isOpen={isFormulaDecantOpen}
        onClose={() => setIsFormulaDecantOpen(false)}
        costoEnvaseDecantARSInicial={configDecant.costoEnvaseDecantARS}
        multiplicadorInsumoDecantInicial={configDecant.multiplicadorInsumoDecant}
        divisorFrascoDecantInicial={configDecant.divisorFrascoDecant}
        offsetDecant5mlARSInicial={configDecant.offsetDecant5mlARS}
        cotizacionUSD={configDecant.cotizacionUSD}
      />

      <PdfGeneratorModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} />
    </div>
  );
}