"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { listarPedidos } from "../actions";
import { CardPedido } from "@/components/ventas/card-pedido";
import type { FiltrosPedidos, PedidoListItem } from "@/types/venta";

const FILTROS_INICIALES: FiltrosPedidos = {
  clienteTexto: "",
  fechaDesde: null,
  fechaHasta: null,
  orden: "MAS_NUEVO",
  sinCobrar: false,
  sinArmar: false,
  sinEnviar: false,
  sinRetirar: false,
};

type FiltroToggle = "sinCobrar" | "sinArmar" | "sinEnviar" | "sinRetirar";

const TOGGLES: { label: string; key: FiltroToggle }[] = [
  { label: "Sin cobrar", key: "sinCobrar" },
  { label: "Sin armar", key: "sinArmar" },
  { label: "Sin retirar", key: "sinRetirar" },
];

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoListItem[]>([]);
  const [filtros, setFiltros] = useState<FiltrosPedidos>(FILTROS_INICIALES);
  const [clienteInput, setClienteInput] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setFiltros((f) => ({ ...f, clienteTexto: clienteInput }));
    }, 350);
    return () => clearTimeout(t);
  }, [clienteInput]);

  const cargar = useCallback(async () => {
    setCargando(true);
    const resultado = await listarPedidos(filtros);
    setPedidos(resultado.pedidos);
    setCargando(false);
  }, [filtros]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function toggleFiltro(key: FiltroToggle) {
    setFiltros((f) => ({ ...f, [key]: !f[key] }));
  }

  // Columnas: excluyentes entre sí, según las banderas booleanas.
  const porArmar = pedidos.filter((p) => !p.armado);
  const pendienteEnvio = pedidos.filter((p) => p.armado && p.enviado && !p.retirado);
  const pendienteRetirar = pedidos.filter((p) => p.armado && !p.retirado);

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Pedidos</h1>
        <p className="text-sm text-text-dim">Tablero de preparación y entrega</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
            <input
              value={clienteInput}
              onChange={(e) => setClienteInput(e.target.value)}
              placeholder="Cliente o Nº de pedido..."
              className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TOGGLES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => toggleFiltro(t.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filtros[t.key]
                    ? "bg-primary text-white"
                    : "border border-border bg-bg text-text-dim hover:text-text"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="date"
            value={filtros.fechaDesde ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, fechaDesde: e.target.value || null }))}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="hidden text-text-dim sm:inline">—</span>
          <input
            type="date"
            value={filtros.fechaHasta ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, fechaHasta: e.target.value || null }))}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <select
            value={filtros.orden}
            onChange={(e) => setFiltros((f) => ({ ...f, orden: e.target.value as "MAS_NUEVO" | "MAS_VIEJO" }))}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="MAS_NUEVO">Más nuevo primero</option>
            <option value="MAS_VIEJO">Más viejo primero</option>
          </select>
        </div>
      </div>

      {/* Columnas */}
      {cargando ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-dim">
          Cargando...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Columna
            titulo="Por armar"
            subtitulo="Recibidos y pendientes de preparar"
            color="amber"
            pedidos={porArmar}
            onCambio={cargar}
          />
          <Columna
            titulo="Pendiente de retirar"
            subtitulo="Armados — esperando que el cliente retire"
            color="success"
            pedidos={pendienteRetirar}
            onCambio={cargar}
          />
        </div>
      )}
    </div>
  );
}

const ESTILOS_COLUMNA = {
  amber: { fondo: "bg-amber/5", punto: "bg-amber", texto: "text-amber" },
  primary: { fondo: "bg-primary/5", punto: "bg-primary", texto: "text-primary" },
  success: { fondo: "bg-success/5", punto: "bg-success", texto: "text-success" },
} as const;

function Columna({
  titulo,
  subtitulo,
  color,
  pedidos,
  onCambio,
}: {
  titulo: string;
  subtitulo: string;
  color: keyof typeof ESTILOS_COLUMNA;
  pedidos: PedidoListItem[];
  onCambio: () => void;
}) {
  const estilo = ESTILOS_COLUMNA[color];
  return (
    <div className={cn("rounded-xl border border-border p-3", estilo.fondo)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", estilo.punto)} />
        <h2 className={cn("font-semibold", estilo.texto)}>{titulo}</h2>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-text-dim">
          {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}
        </span>
      </div>
      <p className={cn("mb-3 text-xs", estilo.texto)}>{subtitulo}</p>

      <div className="max-h-[600px] space-y-2 overflow-y-auto">
        {pedidos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-text-dim">
            No hay pedidos acá 🎉
          </div>
        ) : (
          pedidos.map((p) => <CardPedido key={p.id} pedido={p} onCambio={onCambio} />)
        )}
      </div>
    </div>
  );
}