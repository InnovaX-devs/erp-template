"use client";

import { useState, useEffect, useCallback } from "react";

interface Elemento {
  id: number;
  nombre: string;
  activa: boolean;
  cantidadProductos: number;
}

interface SeccionProps {
  titulo: string;
  singular: string;
  endpoint: string; // ej: "/api/marcas"
}

function TablaSeccion({ titulo, singular, endpoint }: SeccionProps) {
  const [items, setItems] = useState<Elemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemEditar, setItemEditar] = useState<Elemento | null>(null);
  const [nombreForm, setNombreForm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Cargar lista
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Error al cargar ${titulo}`);
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, titulo]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Filtrado por buscador
  const itemsFiltrados = items.filter((item) =>
    item.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Abrir Modal Crear
  const handleOpenCrear = () => {
    setItemEditar(null);
    setNombreForm("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  // Abrir Modal Editar
  const handleOpenEditar = (item: Elemento) => {
    setItemEditar(item);
    setNombreForm(item.nombre);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  // Guardar (Crear / Editar)
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreForm.trim()) {
      setErrorMsg("El nombre es requerido");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const url = itemEditar ? `${endpoint}/${itemEditar.id}` : endpoint;
      const method = itemEditar ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreForm.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Activa / Desactivar
  const handleToggleEstado = async (item: Elemento) => {
    try {
      const res = await fetch(`${endpoint}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !item.activa }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al cambiar el estado");
        return;
      }

      fetchItems();
    } catch (err) {
      alert("Error al conectar con el servidor");
    }
  };

  // Eliminar
  const handleEliminar = async (item: Elemento) => {
    if (item.cantidadProductos > 0) {
      alert(
        `⚠️ No se puede eliminar "${item.nombre}" porque tiene ${item.cantidadProductos} producto(s) asociado(s).\n\nPuedes desactivarla en su lugar.`
      );
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar "${item.nombre}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${endpoint}/${item.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al eliminar");
        return;
      }

      fetchItems();
    } catch (err) {
      alert("Error al intentar eliminar");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
      {/* Encabezado y Botón Nuevo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
          <p className="text-sm text-slate-500">
            Total registrados: {items.length}
          </p>
        </div>
        <button
          onClick={handleOpenCrear}
          className="inline-flex items-center justify-center gap-2 bg-[#021541] cursor-pointer hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
        >
          <span>+</span> Nueva {singular}
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <input
          type="text"
          placeholder={`Buscar ${singular.toLowerCase()}...`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <svg
          className="w-4 h-4 text-slate-400 absolute left-3 top-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4 text-center">Productos</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  Cargando {titulo.toLowerCase()}...
                </td>
              </tr>
            ) : itemsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No se encontraron {titulo.toLowerCase()}.
                </td>
              </tr>
            ) : (
              itemsFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {item.nombre}
                  </td>

                  {/* Cantidad de productos asociados real */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full text-xs">
                      {item.cantidadProductos}
                    </span>
                  </td>

                  {/* Estado Activa / Inactiva */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleEstado(item)}
                      title={item.activa ? "Clic para desactivar" : "Clic para activar"}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        item.activa
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                      }`}
                    >
                      {item.activa ? "Activa" : "Inactiva"}
                    </button>
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditar(item)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-xs px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(item)}
                      className="text-rose-600 hover:text-rose-900 font-medium text-xs px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear / Editar (Un solo campo: nombre) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {itemEditar ? `Editar ${singular}` : `Nueva ${singular}`}
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre de {singular} *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={`Ej: ${singular === "Marca" ? "Chanel" : "Perfumes"}`}
                  value={nombreForm}
                  onChange={(e) => setNombreForm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarcasCategoriasPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Marcas y Categorías
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Administra las marcas y categorías disponibles para los productos.
        </p>
      </div>

      {/* Dos Tablas Independientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TablaSeccion
          titulo="Marcas"
          singular="Marca"
          endpoint="/api/marcas"
        />
        <TablaSeccion
          titulo="Categorías"
          singular="Categoría"
          endpoint="/api/categorias"
        />
      </div>
    </div>
  );
}