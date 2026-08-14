"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Receipt,
  PackagePlus,
  FlaskConical,
  Users,
  Wallet,
  Droplets,
  TrendingUp,
  Settings,
} from "lucide-react";
import { TodasCuentasModal } from "@/components/dashboard/todas-cuentas-modal";
import { formatCurrency } from "@/lib/currency";

interface DashboardData {
  cuentas: {
    saldoTotal: number;
    principales: { id: number; nombre: string; tipo: string; saldoActual: number }[];
    totalCantidad: number;
  };
  hoy: { gananciaARS: number; cantidadVentas: number };
  pedidos: { porArmar: number; armados: number };
}

const ACCESOS_RAPIDOS = [
  { label: "Ventas", href: "/ventas", icon: Receipt },
  { label: "Compras", href: "/compras", icon: PackagePlus },
  { label: "Productos", href: "/productos", icon: FlaskConical },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Gastos", href: "/finanzas/gastos", icon: Wallet },
  { label: "Reportes", href: "/reportes", icon: Droplets },
];

export default function DashboardPage() {
  const [datos, setDatos] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modalCuentasAbierto, setModalCuentasAbierto] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error();
      setDatos(await res.json());
    } catch {
      toast.error("No se pudo cargar el panorama general");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Panorama General</h1>
          <p className="text-sm text-text-dim">Resumen de actividad de hoy</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/productos"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-dim hover:bg-surface-hover"
          >
            Consultar precio
          </Link>
          <Link
            href="/ventas"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            + Nueva Venta
          </Link>
        </div>
      </div>

      {/* Saldo total */}
      <div className="rounded-2xl bg-ink p-6 text-ivory">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-ivory/50">Saldo Total</p>
          <Link
            href="/finanzas"
            className="rounded-lg bg-white/10 p-2 hover:bg-white/15"
            title="Ir a Contabilidad"
          >
            <Settings size={16} />
          </Link>
        </div>
        <p className="mt-1 font-display text-3xl font-semibold">
          {cargando ? "..." : formatCurrency(datos?.cuentas.saldoTotal ?? 0, "ARS")}
        </p>

        {!cargando && datos && datos.cuentas.principales.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 sm:grid-cols-5">
            {datos.cuentas.principales.map((c) => (
              <div key={c.id}>
                <p className="truncate text-[11px] uppercase tracking-wide text-ivory/40">{c.nombre}</p>
                <p className="text-sm font-medium text-amber">
                  {formatCurrency(c.saldoActual, c.tipo.endsWith("USD") ? "USD" : "ARS")}
                </p>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => setModalCuentasAbierto(true)} className="mt-4 text-xs font-medium text-amber hover:underline">
          Ver todas ({datos?.cuentas.totalCantidad ?? 0}) →
        </button>
      </div>

      {/* Hoy + Pedidos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-text-dim">Hoy</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10 text-success">
              <TrendingUp size={14} />
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-text">
            {cargando ? "..." : formatCurrency(datos?.hoy.gananciaARS ?? 0, "ARS")}
          </p>
          <div className="mt-3 flex items-center gap-6 border-t border-border pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-text-dim">Ganancia</p>
              <p className="text-sm font-semibold text-success">
                {cargando ? "..." : formatCurrency(datos?.hoy.gananciaARS ?? 0, "ARS")}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-text-dim">Ventas</p>
              <p className="text-sm font-semibold text-text">
                {cargando ? "..." : datos?.hoy.cantidadVentas ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Pedidos por armar</p>
          <p className="mt-1 text-2xl font-semibold text-warning">
            {cargando ? "..." : datos?.pedidos.porArmar ?? 0}
          </p>
          <Link href="/ventas/pedidos" className="mt-1 inline-block text-xs text-primary hover:underline">
            Ver pedidos →
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wide text-text-dim">Pedidos armados</p>
          <p className="mt-1 text-2xl font-semibold text-success">
            {cargando ? "..." : datos?.pedidos.armados ?? 0}
          </p>
          <Link href="/ventas/pedidos" className="mt-1 inline-block text-xs text-primary hover:underline">
            Ver pedidos →
          </Link>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-4 font-medium text-text">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ACCESOS_RAPIDOS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 text-center text-sm font-medium text-text-dim transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <a.icon size={20} />
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      <TodasCuentasModal isOpen={modalCuentasAbierto} onClose={() => setModalCuentasAbierto(false)} />
    </div>
  );
}