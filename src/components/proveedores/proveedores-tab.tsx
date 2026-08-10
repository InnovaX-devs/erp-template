"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  ProveedorFormModal,
  type ProveedorFormData,
} from "@/components/proveedores/proveedor-form-modal";

interface Proveedor {
  id: string;
  nombre: string;
  personaContacto: string | null;
  telefono: string | null;
  email: string | null;
  deudaInicial: number;
  notas: string | null;
  cantidadCompras: number;
  totalComprado: number;
  deuda: number;
  alDia: boolean;
}

interface Resumen {
  totalProveedores: number;
  totalComprado: number;
  deudasTotales: number;
}

type FiltroEstado = "todos" | "con-deuda" | "al-dia";

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "con-deuda", label: "Con deuda" },
  { value: "al-dia", label: "Al día" },
];

export function ProveedoresTab() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proveedorEditar, setProveedorEditar] = useState<ProveedorFormData | null>(null);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [resumen, setResumen] = useState<Resumen>({
    totalProveedores: 0,
    totalComprado: 0,
    deudasTotales: 0,
  });
  const [cargando, setCargando] = useState(true);

  const cargarProveedores = useCallback(async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams();
      if (busqueda) params.set("q", busqueda);
      if (filtroEstado !== "todos") params.set("estado", filtroEstado);

      const res = await fetch(`/api/proveedores?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProveedores(data.items);
        setResumen(data.resumen);
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroEstado]);

  useEffect(() => {
    // Pequeño debounce para no pegarle a la API en cada tecla
    const timeout = setTimeout(cargarProveedores, 250);
    return () => clearTimeout(timeout);
  }, [cargarProveedores]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleAbrirCrear = () => {
    setProveedorEditar(null);
    setIsModalOpen(true);
  };

  const handleAbrirEditar = (p: Proveedor) => {
    setProveedorEditar({
      id: p.id,
      nombre: p.nombre,
      personaContacto: p.personaContacto ?? "",
      telefono: p.telefono ?? "",
      email: p.email ?? "",
      deudaInicial: p.deudaInicial,
      notas: p.notas ?? "",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-text">Proveedores</h2>
          <p className="text-sm text-text-dim">Gestión de proveedores y su deuda</p>
        </div>
        <button
          type="button"
          onClick={handleAbrirCrear}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nuevo Proveedor
        </button>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Total Proveedores</p>
          <p className="mt-1 text-2xl font-semibold text-text">{resumen.totalProveedores}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Total Comprado</p>
          <p className="mt-1 text-2xl font-semibold text-text">
            {formatMoney(resumen.totalComprado)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Deudas Totales</p>
          <p className="mt-1 text-2xl font-semibold text-danger">
            {formatMoney(resumen.deudasTotales)}
          </p>
        </div>
      </div>

      {/* Filtros y tabla */}
      <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-primary focus:outline-none sm:w-64"
        />

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFiltroEstado(f.value)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                filtroEstado === f.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-text-dim hover:text-text"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="pb-3 pr-4 font-medium">Proveedor</th>
                <th className="pb-3 pr-4 font-medium">Contacto</th>
                <th className="pb-3 pr-4 font-medium">Compras</th>
                <th className="pb-3 pr-4 font-medium">Total comprado</th>
                <th className="pb-3 pr-4 font-medium">Deuda</th>
                <th className="pb-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-text-dim">
                    Cargando proveedores...
                  </td>
                </tr>
              ) : proveedores.length > 0 ? (
                proveedores.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 hover:bg-surface-hover/50"
                  >
                    <td className="py-3 pr-4 font-medium text-text">{p.nombre}</td>
                    <td className="py-3 pr-4 text-text-dim">
                      {p.personaContacto || p.telefono || p.email || "-"}
                    </td>
                    <td className="py-3 pr-4 text-text-dim">{p.cantidadCompras}</td>
                    <td className="py-3 pr-4 text-text-dim">
                      {formatMoney(p.totalComprado)}
                    </td>
                    <td className="py-3 pr-4">
                      {p.alDia ? (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                          Al día
                        </span>
                      ) : (
                        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                          {formatMoney(p.deuda)}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleAbrirEditar(p)}
                        className="text-text-dim hover:text-text"
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-text-dim">
                    No se encontraron proveedores que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProveedorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        proveedorEditar={proveedorEditar}
        onSuccess={cargarProveedores}
      />
    </div>
  );
}
