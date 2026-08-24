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
  Eye,
  EyeOff,
  Zap,
  Package,
  Tag,
} from "lucide-react";
import { TodasCuentasModal } from "@/components/dashboard/todas-cuentas-modal";
import { ModalConsultarPrecio } from "@/components/ventas/modal-consultar-precio";
import { formatCurrency } from "@/lib/currency";

interface CuentaPrincipal {
  id: number;
  nombre: string;
  tipo: string;
  saldoActual: number;
  color?: string | null;
}

interface Movimiento {
  id: number;
  hora: string;
  descripcion: string;
  monto: number;
  moneda: "ARS" | "USD";
  tipo: "ingreso" | "egreso";
  ventaId: number | null;
}

interface DashboardData {
  cuentas: {
    saldoTotal: number;
    principales: CuentaPrincipal[];
    totalCantidad: number;
  };
  hoy: {
    gananciaARS: number;
    cantidadVentas: number;
    ingresosARS: number;
    egresosARS: number;
  };
  pedidos: { porArmar: number; armados: number };
  movimientos: Movimiento[];
}

const ACCESOS_RAPIDOS = [
  { label: "Ventas", href: "/ventas", icon: Receipt },
  { label: "Compras", href: "/compras", icon: PackagePlus },
  { label: "Productos", href: "/productos", icon: FlaskConical },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Gastos", href: "/finanzas/gastos", icon: Wallet },
  { label: "Reportes", href: "/reportes", icon: Droplets },
];

const OCULTO = "••••••";

export default function DashboardPage() {
  const [datos, setDatos] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modalCuentasAbierto, setModalCuentasAbierto] = useState(false);
  const [modalPrecioAbierto, setModalPrecioAbierto] = useState(false);
  const [mostrarSaldos, setMostrarSaldos] = useState(true);

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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setModalPrecioAbierto(true)}
          className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-dim hover:bg-surface-hover"
        >
          <Tag size={14} /> Consultar precio
        </button>
        <Link
          href="/ventas"
          className="rounded-lg bg-[#021541] cursor-pointer px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nueva Venta
        </Link>
      </div>

      {/* Saldo total + Hoy */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Saldo total */}
        <div className="rounded-2xl bg-ink p-6 text-ivory">
          {/* Parte de arriba: label + ojito + monto -> va a /finanzas */}
          <Link href="/finanzas" className="block rounded-xl -m-1 p-1 transition-opacity hover:opacity-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <p className="text-xs uppercase tracking-widest text-ivory/50">Saldo Total</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMostrarSaldos((prev) => !prev);
                  }}
                  className="cursor-pointer rounded p-0.5 text-ivory/40 hover:text-ivory/70"
                  title={mostrarSaldos ? "Ocultar saldos" : "Mostrar saldos"}
                >
                  {mostrarSaldos ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              </div>
            </div>

            <p className="mt-1 font-display text-3xl font-semibold">
              {cargando ? "..." : mostrarSaldos ? formatCurrency(datos?.cuentas.saldoTotal ?? 0, "ARS") : OCULTO}
            </p>
          </Link>

          {/* Parte de abajo: grid de cuentas (no clickeable) + "Ver todas" -> abre el modal */}
          <div>
            {!cargando && datos && datos.cuentas.principales.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 sm:grid-cols-5">
                {datos.cuentas.principales.slice(0, 5).map((c) => (
                  <div key={c.id} className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[11px] uppercase tracking-wide text-primary/60">
                      {c.color && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                      )}
                      {c.nombre}
                    </p>
                    <p className="truncate text-sm font-semibold text-white">
                      {mostrarSaldos ? formatCurrency(c.saldoActual, c.tipo.endsWith("USD") ? "USD" : "ARS") : OCULTO}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setModalCuentasAbierto(true)}
              className="mt-4 cursor-pointer text-xs font-medium text-amber hover:underline"
            >
              Ver todas ({datos?.cuentas.totalCantidad ?? 0}) →
            </button>
          </div>
        </div>

        {/* Hoy */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-text-dim">Hoy</p>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10 text-success">
              <TrendingUp size={14} />
            </span>
          </div>
          <p className="mt-1 text-3xl font-bold text-text">
            {cargando ? "..." : formatCurrency(datos?.hoy.ingresosARS ?? 0, "ARS")}
          </p>
          <div className="mt-6 flex items-center gap-10 border-t border-border pt-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-dim">Ganancia</p>
              <p className="text-lg font-semibold text-success">
                {cargando ? "..." : formatCurrency(datos?.hoy.gananciaARS ?? 0, "ARS")}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-dim">Ventas</p>
              <p className="text-lg font-semibold text-text">
                {cargando ? "..." : datos?.hoy.cantidadVentas ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ACCESOS_RAPIDOS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center text-sm font-medium text-text-dim transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <a.icon size={20} />
            {a.label}
          </Link>
        ))}
      </div>

      {/* Movimientos de hoy + Pedidos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Movimientos de hoy */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              <h2 className="font-medium text-text">Movimientos de hoy</h2>
              {!!datos?.movimientos.length && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                  {datos.movimientos.length}
                </span>
              )}
            </div>
            <Link href="/finanzas/flujo-caja" className="text-xs font-medium text-primary hover:underline">
              Ver todo →
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-xs text-text-dim">Ingresos</p>
              <p className="font-semibold text-success">
                +{formatCurrency(datos?.hoy.ingresosARS ?? 0, "ARS")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-dim">Egresos</p>
              <p className="font-semibold text-danger">
                -{formatCurrency(datos?.hoy.egresosARS ?? 0, "ARS")}
              </p>
            </div>
          </div>

          <div className="mt-1 divide-y divide-border">
            {(datos?.movimientos ?? []).map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    m.tipo === "ingreso" ? "bg-success" : "bg-danger"
                  }`}
                />
                <span className="w-16 shrink-0 text-xs text-text-dim">{m.hora}</span>
                <span className="flex-1 truncate text-sm text-text">{m.descripcion}</span>
                <span
                  className={`text-sm font-semibold ${
                    m.tipo === "ingreso" ? "text-success" : "text-danger"
                  }`}
                >
                  {m.tipo === "ingreso" ? "+" : "-"}
                  {formatCurrency(m.monto, m.moneda)}
                </span>
              </div>
            ))}
            {!cargando && !datos?.movimientos.length && (
              <p className="py-4 text-center text-sm text-text-dim">Sin movimientos hoy</p>
            )}
          </div>
        </div>

        {/* Pedidos */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-warning" />
              <h2 className="font-medium text-text">Pedidos</h2>
            </div>
            <Link href="/ventas/pedidos" className="text-xs font-medium text-primary hover:underline">
              Ver todos →
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {!!datos?.pedidos.porArmar && (
              <div className="flex items-center justify-between rounded-lg bg-warning/10 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm font-medium text-text">
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  Por armar
                </span>
                <span className="rounded-full bg-warning px-2.5 py-0.5 text-xs font-semibold text-white">
                  {datos.pedidos.porArmar}
                </span>
              </div>
            )}
            {!!datos?.pedidos.armados && (
              <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm font-medium text-text">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Armados
                </span>
                <span className="rounded-full bg-success px-2.5 py-0.5 text-xs font-semibold text-white">
                  {datos.pedidos.armados}
                </span>
              </div>
            )}
            {!cargando && !datos?.pedidos.porArmar && !datos?.pedidos.armados && (
              <p className="py-4 text-center text-sm text-text-dim">Sin pedidos pendientes</p>
            )}
          </div>
        </div>
      </div>

      <TodasCuentasModal
        isOpen={modalCuentasAbierto}
        onClose={() => setModalCuentasAbierto(false)}
        saldoTotal={datos?.cuentas.saldoTotal ?? 0}
      />
    </div>
  );
}