"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import {
  ProveedorFormModal,
} from "@/components/proveedores/proveedor-form-modal";
import { ProveedorDetalleModal } from "@/components/proveedores/proveedor-detalle-modal";

interface Proveedor {
  id: string;
  nombre: string;
  personaContacto: string | null;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  cantidadCompras: number;
  totalComprado: number;
}

interface Resumen {
  totalProveedores: number;
  totalComprado: number;
}

export function ProveedoresTab() {
  const [busqueda, setBusqueda] = useState("");

  const [isCrearOpen, setIsCrearOpen] = useState(false);
  const [proveedorDetalle, setProveedorDetalle] = useState<Proveedor | null>(null);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [resumen, setResumen] = useState<Resumen>({ totalProveedores: 0, totalComprado: 0 });
  const [cargando, setCargando] = useState(true);

  const cargarProveedores = useCallback(async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams();
      if (busqueda) params.set("q", busqueda);

      const res = await fetch(`/api/proveedores?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProveedores(data.items);
        setResumen({
          totalProveedores: data.resumen.totalProveedores,
          totalComprado: data.resumen.totalComprado,
        });
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    } finally {
      setCargando(false);
    }
  }, [busqueda]);

  useEffect(() => {
    const timeout = setTimeout(cargarProveedores, 250);
    return () => clearTimeout(timeout);
  }, [cargarProveedores]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-text">Proveedores</h2>
          <p className="text-sm text-text-dim">Gestión de proveedores</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCrearOpen(true)}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nuevo Proveedor
        </button>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      {/* Buscador y tabla */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-primary focus:outline-none sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="pb-3 pr-4 font-medium">Proveedor</th>
                <th className="pb-3 pr-4 font-medium">Contacto</th>
                <th className="pb-3 pr-4 font-medium">Compras</th>
                <th className="pb-3 pr-4 font-medium">Total comprado</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-text-dim">
                    Cargando proveedores...
                  </td>
                </tr>
              ) : proveedores.length > 0 ? (
                proveedores.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setProveedorDetalle(p)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-hover/50"
                  >
                    <td className="py-3 pr-4 font-medium text-text">{p.nombre}</td>
                    <td className="py-3 pr-4 text-text-dim">
                      {p.personaContacto || p.telefono || p.email || "-"}
                    </td>
                    <td className="py-3 pr-4 text-text-dim">{p.cantidadCompras}</td>
                    <td className="py-3 pr-4 text-text-dim">{formatMoney(p.totalComprado)}</td>
                    <td className="py-3 pr-4 text-right text-text-dim">→</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-text-dim">
                    No se encontraron proveedores que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProveedorFormModal
        isOpen={isCrearOpen}
        onClose={() => setIsCrearOpen(false)}
        onSuccess={cargarProveedores}
      />

      <ProveedorDetalleModal
        isOpen={proveedorDetalle !== null}
        onClose={() => setProveedorDetalle(null)}
        proveedor={proveedorDetalle}
        onSuccess={cargarProveedores}
      />
    </div>
  );
}