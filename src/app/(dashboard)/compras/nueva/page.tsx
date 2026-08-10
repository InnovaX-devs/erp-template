"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

interface Proveedor {
  id: number;
  nombre: string;
}

interface CuentaOpcion {
  id: number;
  nombre: string;
  tipo: "EFECTIVO_ARS" | "EFECTIVO_USD" | "BANCO_ARS" | "BANCO_USD";
}

interface ProductoBusqueda {
  id: number;
  nombre: string;
  codigoBarras: string | null;
  stockActual: number;
  precioCosto: number;
  monedaPrecio: "USD" | "ARS";
  marca?: { nombre: string } | null;
}

interface ItemCarrito {
  productoId: number;
  nombre: string;
  cantidad: number;
  costoUnitarioUSD: number;
}

const TIPO_CUENTA_LABEL: Record<CuentaOpcion["tipo"], string> = {
  EFECTIVO_ARS: "Efectivo ARS",
  EFECTIVO_USD: "Efectivo USD",
  BANCO_ARS: "Banco ARS",
  BANCO_USD: "Banco USD",
};

const esTipoCuentaUSD = (tipo: CuentaOpcion["tipo"]) =>
  tipo === "EFECTIVO_USD" || tipo === "BANCO_USD";

export default function NuevaCompraPage() {
  const router = useRouter();

  // Proveedor
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState<string>("");
  const [altaRapidaAbierta, setAltaRapidaAbierta] = useState(false);
  const [nombreProveedorNuevo, setNombreProveedorNuevo] = useState("");
  const [creandoProveedor, setCreandoProveedor] = useState(false);

  // Cuenta de pago (reemplaza al viejo tipoPago)
  const [cuentas, setCuentas] = useState<CuentaOpcion[]>([]);
  const [cuentaId, setCuentaId] = useState<string>("");

  // Cotización (para mostrar total en ARS y convertir costos de productos en ARS)
  const [cotizacion, setCotizacion] = useState<number>(1000);

  // Buscador de producto
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ProductoBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const inputBusquedaRef = useRef<HTMLInputElement>(null);

  // Carrito
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  // Envío
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [compraCreada, setCompraCreada] = useState<{ id: number } | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [errorConfirmar, setErrorConfirmar] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/proveedores")
      .then((r) => r.json())
      .then((data) => setProveedores(data.items ?? data))
      .catch(() => setProveedores([]));

    fetch("/api/cuentas")
      .then((r) => r.json())
      .then((data) => setCuentas(data.items ?? []))
      .catch(() => setCuentas([]));

    // Ajustá el endpoint si tu ruta de configuración tiene otro nombre/forma.
    fetch("/api/configuracion")
      .then((r) => r.json())
      .then((data) => {
        if (data?.cotizacionUSD) setCotizacion(Number(data.cotizacionUSD));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!busqueda.trim()) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/productos/buscar?q=${encodeURIComponent(busqueda.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResultados(data.items ?? []);
        }
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  const agregarAlCarrito = useCallback(
    (producto: ProductoBusqueda) => {
      // El costo de compra siempre se carga en USD. Si el producto tiene
      // su costo en ARS, convertimos con la cotización actual como punto
      // de partida (el usuario puede corregirlo a mano).
      const costoUnitarioUSD =
        producto.monedaPrecio === "ARS"
          ? Number((producto.precioCosto / cotizacion).toFixed(2))
          : producto.precioCosto;

      setCarrito((prev) => {
        const existente = prev.find((it) => it.productoId === producto.id);
        if (existente) {
          return prev.map((it) =>
            it.productoId === producto.id ? { ...it, cantidad: it.cantidad + 1 } : it
          );
        }
        return [
          ...prev,
          {
            productoId: producto.id,
            nombre: producto.nombre,
            cantidad: 1,
            costoUnitarioUSD,
          },
        ];
      });
      setBusqueda("");
      setResultados([]);
      inputBusquedaRef.current?.focus();
    },
    [cotizacion]
  );

  const handleKeyDownBusqueda = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && resultados.length > 0) {
      e.preventDefault();
      const exacto = resultados.find((r) => r.codigoBarras === busqueda.trim());
      agregarAlCarrito(exacto ?? resultados[0]);
    }
  };

  const actualizarItem = (
    productoId: number,
    campo: "cantidad" | "costoUnitarioUSD",
    valor: number
  ) => {
    setCarrito((prev) =>
      prev.map((it) => (it.productoId === productoId ? { ...it, [campo]: valor } : it))
    );
  };

  const quitarItem = (productoId: number) => {
    setCarrito((prev) => prev.filter((it) => it.productoId !== productoId));
  };

  const totalUSD = useMemo(
    () => carrito.reduce((acc, it) => acc + it.cantidad * it.costoUnitarioUSD, 0),
    [carrito]
  );
  const totalARS = totalUSD * cotizacion;

  const cuentaSeleccionada = cuentas.find((c) => String(c.id) === cuentaId);

  const crearProveedorRapido = async () => {
    if (!nombreProveedorNuevo.trim()) return;
    setCreandoProveedor(true);
    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreProveedorNuevo.trim() }),
      });
      if (res.ok) {
        const nuevo = await res.json();
        setProveedores((prev) => [...prev, nuevo]);
        setProveedorId(String(nuevo.id));
        setNombreProveedorNuevo("");
        setAltaRapidaAbierta(false);
      }
    } finally {
      setCreandoProveedor(false);
    }
  };

  const guardarCompra = async () => {
    if (carrito.length === 0) {
      setError("Agregá al menos un producto a la compra.");
      return;
    }
    if (!cuentaId) {
      setError("Elegí la cuenta desde la que se va a pagar la compra.");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proveedorId: proveedorId || null,
          cuentaId: Number(cuentaId),
          items: carrito.map((it) => ({
            productoId: it.productoId,
            cantidad: it.cantidad,
            costoUnitarioUSD: it.costoUnitarioUSD,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la compra");
      setCompraCreada({ id: data.id });
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar la compra");
    } finally {
      setEnviando(false);
    }
  };

  const confirmarCompra = async () => {
    if (!compraCreada) return;
    setConfirmando(true);
    setErrorConfirmar(null);
    try {
      const res = await fetch(`/api/compras/${compraCreada.id}/confirmar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al confirmar la compra");
      router.push("/compras");
    } catch (err: any) {
      setErrorConfirmar(err.message || "Ocurrió un error al confirmar la compra");
    } finally {
      setConfirmando(false);
    }
  };

  if (compraCreada) {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="rounded-xl border border-border bg-surface p-8">
          <p className="text-lg font-semibold text-text">Compra #{compraCreada.id} guardada</p>
          <p className="mt-2 text-sm text-text-dim">
            Todavía no impactó en stock, costo ni caja. Confirmala para actualizar el
            inventario y descontar el saldo de la cuenta, o hacelo más tarde desde el listado.
          </p>

          {errorConfirmar && <p className="mt-3 text-sm text-danger">{errorConfirmar}</p>}

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              disabled={confirmando}
              onClick={confirmarCompra}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {confirmando ? "Confirmando..." : "Confirmar compra ahora"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/compras")}
              className="rounded-lg border border-border px-4 py-2.5 text-sm text-text-dim hover:text-text"
            >
              Confirmar más tarde
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">Nueva Compra</h1>
        <p className="text-sm text-text-dim">Cargá los productos y revisá el total</p>
      </div>

      {/* Proveedor */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <p className="text-xs uppercase tracking-wide text-text-dim">Proveedor (opcional)</p>
        {!altaRapidaAbierta ? (
          <div className="flex items-center gap-2">
            <select
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            >
              <option value="">Sin especificar</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setAltaRapidaAbierta(true)}
              className="whitespace-nowrap rounded-lg border border-border px-3 py-2 text-sm text-text-dim hover:text-text"
            >
              + Nuevo
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              placeholder="Nombre del proveedor"
              value={nombreProveedorNuevo}
              onChange={(e) => setNombreProveedorNuevo(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              disabled={creandoProveedor || !nombreProveedorNuevo.trim()}
              onClick={crearProveedorRapido}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setAltaRapidaAbierta(false)}
              className="rounded-lg border border-border px-3 py-2 text-sm text-text-dim hover:text-text"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Cuenta de pago */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <p className="text-xs uppercase tracking-wide text-text-dim">
          Cuenta desde la que se paga
        </p>
        <select
          value={cuentaId}
          onChange={(e) => setCuentaId(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        >
          <option value="">Elegí una cuenta...</option>
          {cuentas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} — {TIPO_CUENTA_LABEL[c.tipo]}
            </option>
          ))}
        </select>
        {cuentas.length === 0 && (
          <p className="text-xs text-text-dim">
            No hay cuentas activas registradas. Creá una desde Caja/Cuentas antes de comprar.
          </p>
        )}
      </div>

      {/* Buscador de producto */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <p className="text-xs uppercase tracking-wide text-text-dim">
          Buscar producto / código de barras
        </p>
        <div className="relative">
          <input
            ref={inputBusquedaRef}
            type="text"
            autoFocus
            placeholder="Nombre o código de barras..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={handleKeyDownBusqueda}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-primary focus:outline-none"
          />
          {(resultados.length > 0 || buscando) && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg">
              {buscando ? (
                <p className="px-3 py-2 text-sm text-text-dim">Buscando...</p>
              ) : (
                resultados.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => agregarAlCarrito(p)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-hover"
                  >
                    <span className="text-text">
                      {p.nombre}
                      {p.marca?.nombre ? ` — ${p.marca.nombre}` : ""}
                    </span>
                    <span className="text-xs text-text-dim">
                      Stock: {p.stockActual} · Costo: {p.precioCosto} {p.monedaPrecio}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Carrito */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-text-dim">Ítems de la compra</p>
        {carrito.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-dim">
            Todavía no agregaste productos.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="pb-2 pr-4 font-medium">Producto</th>
                <th className="pb-2 pr-4 font-medium">Cantidad</th>
                <th className="pb-2 pr-4 font-medium">Costo unit. (USD)</th>
                <th className="pb-2 pr-4 font-medium">Subtotal USD</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {carrito.map((it) => (
                <tr key={it.productoId} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 text-text">{it.nombre}</td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      min={1}
                      value={it.cantidad}
                      onChange={(e) =>
                        actualizarItem(it.productoId, "cantidad", Math.max(1, Number(e.target.value)))
                      }
                      className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-text focus:border-primary focus:outline-none"
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={it.costoUnitarioUSD}
                      onChange={(e) =>
                        actualizarItem(
                          it.productoId,
                          "costoUnitarioUSD",
                          Math.max(0, Number(e.target.value))
                        )
                      }
                      className="w-24 rounded-md border border-border bg-surface px-2 py-1 text-text focus:border-primary focus:outline-none"
                    />
                  </td>
                  <td className="py-2 pr-4 font-medium text-text">
                    {(it.cantidad * it.costoUnitarioUSD).toFixed(2)}
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => quitarItem(it.productoId)}
                      className="text-text-dim hover:text-danger"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Total + guardar */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-dim">Total</p>
            <p className="text-2xl font-semibold text-text">USD {totalUSD.toFixed(2)}</p>
            <p className="text-sm text-text-dim">
              ≈ ARS {totalARS.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
              {cuentaSeleccionada && (
                <span>
                  {" "}
                  · se debitará en {TIPO_CUENTA_LABEL[cuentaSeleccionada.tipo]} al confirmar
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            disabled={enviando || carrito.length === 0}
            onClick={guardarCompra}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {enviando ? "Guardando..." : "Guardar Compra"}
          </button>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}