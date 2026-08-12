"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tag } from "lucide-react";
import { toast } from "sonner";
import { VentaProvider, useVenta } from "@/components/ventas/venta-context";
import { TogglePrecio } from "@/components/ventas/toggle-precio";
import { BuscadorProducto } from "@/components/ventas/buscador-producto";
import { BuscadorCliente } from "@/components/ventas/buscador-cliente";
import { ModalConsultarPrecio } from "@/components/ventas/modal-consultar-precio";
import { TablaCarrito } from "@/components/ventas/tabla-carrito";
import { ResumenVenta } from "@/components/ventas/resumen-venta";
import { ModalDescuento, type Descuento } from "@/components/ventas/modal-descuento";
import { toArs } from "@/lib/currency";
import type { ProductoBusquedaDTO } from "@/types/producto";
import type { ItemCarrito, TipoPrecioLinea } from "@/types/item-carrito";
import { SelectorCobro } from "@/components/ventas/selector-cobro";
import { confirmarVenta, registrarPedido } from "./actions";
import { obtenerPresupuestoParaConvertir } from "@/app/(dashboard)/presupuestos/actions";
import { ModalPresentacion } from "@/components/ventas/modal-presentacion";
import type { Presentacion } from "@/types/decant";

export default function NuevaVentaPage() {
  return (
    <VentaProvider>
      {/* useSearchParams exige Suspense en Next 16 + Turbopack o rompe el build */}
      <Suspense fallback={null}>
        <NuevaVentaContenido />
      </Suspense>
    </VentaProvider>
  );
}

function NuevaVentaContenido() {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [modalPrecioAbierto, setModalPrecioAbierto] = useState(false);
  const [modalDescuentoAbierto, setModalDescuentoAbierto] = useState(false);
  const [descuento, setDescuento] = useState<Descuento>(null);
  const { tipoPrecio, cliente, setCliente, modoCobro, setModoCobro, pagos, setPagos } = useVenta();

  // --- Prefill desde un Presupuesto ("Convertir a venta") ---
  const searchParams = useSearchParams();
  const presupuestoIdParam = searchParams.get("presupuestoId");
  const [presupuestoIdOrigen, setPresupuestoIdOrigen] = useState<number | null>(null);
  const yaPrecargado = useRef(false);

  const [modalPresentacionAbierto, setModalPresentacionAbierto] = useState(false);
  const [productoParaPresentacion, setProductoParaPresentacion] = useState<ProductoBusquedaDTO | null>(null);

  useEffect(() => {
    if (!presupuestoIdParam || yaPrecargado.current) return;
    yaPrecargado.current = true;

    const id = Number(presupuestoIdParam);
    if (Number.isNaN(id)) return;

    (async () => {
      const resultado = await obtenerPresupuestoParaConvertir(id);
      if (!resultado.success) {
        toast.error(resultado.error);
        return;
      }
      const { data } = resultado;
      setPresupuestoIdOrigen(data.presupuestoId);
      setCarrito(
        data.items.map((item) => ({
          id: item.id,
          producto: item.producto,
          tipoPrecio: item.tipoPrecio,
          cantidad: item.cantidad,
          precioUnitarioArs: item.precioUnitarioArs,
          presentacion: "FRASCO",
          abrioFrascoCerrado: false,
        }))
      );
      setCliente(data.cliente);
      setDescuento(
        data.descuentoPorcentaje != null
          ? { tipo: "PORCENTAJE", valor: data.descuentoPorcentaje }
          : data.descuentoMonto != null
            ? { tipo: "MONTO", valor: data.descuentoMonto }
            : null
      );
      toast.success("Presupuesto cargado. Revisá los datos antes de confirmar.");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presupuestoIdParam]);

  const subtotal = carrito.reduce((acc, it) => acc + it.cantidad * it.precioUnitarioArs, 0);

  const montoDescuento =
    descuento == null ? 0 : descuento.tipo === "PORCENTAJE" ? subtotal * (descuento.valor / 100) : Math.min(descuento.valor, subtotal);
  const total = Math.max(0, subtotal - montoDescuento);

  const [procesando, setProcesando] = useState(false);

  function agregarAlCarrito(
    producto: ProductoBusquedaDTO,
    presentacion: Presentacion,
    precioUnitarioArs: number,
    abrioFrascoCerrado: boolean
  ) {
    const nuevoItem: ItemCarrito = {
      id: `${producto.id}-${Date.now()}`,
      producto,
      tipoPrecio,
      cantidad: 1,
      precioUnitarioArs,
      presentacion,
      abrioFrascoCerrado,
    };

    setCarrito((prev) => [...prev, nuevoItem]);
    const etiqueta = presentacion === "FRASCO" ? "" : presentacion === "DECANT_5ML" ? " (Decant 5ml)" : " (Decant 10ml)";
    toast.success(`${producto.nombre}${etiqueta} agregado (${tipoPrecio === "MAYORISTA" ? "May" : "Min"})`);
  }

  function agregarProducto(producto: ProductoBusquedaDTO) {
    if (producto.seVendePorDecant) {
      setProductoParaPresentacion(producto);
      setModalPresentacionAbierto(true);
      return;
    }

    const precioBaseOriginal =
      tipoPrecio === "MAYORISTA" && producto.precioMayorista != null ? producto.precioMayorista : producto.precioVenta;
    const precioUnitarioArs = toArs(precioBaseOriginal, producto.monedaPrecio);

    agregarAlCarrito(producto, "FRASCO", precioUnitarioArs, false);
  }

  function handleElegirPresentacion(presentacion: Presentacion, precioArs: number, abrioFrascoCerrado: boolean) {
    if (!productoParaPresentacion) return;
    agregarAlCarrito(productoParaPresentacion, presentacion, precioArs, abrioFrascoCerrado);
    setModalPresentacionAbierto(false);
    setProductoParaPresentacion(null);
  }

  function cambiarCantidad(id: string, cantidad: number) {
    setCarrito((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (cantidad > it.producto.stockActual) {
          toast.warning(`Solo hay ${it.producto.stockActual} unidades de "${it.producto.nombre}" en stock`);
          return it;
        }
        return { ...it, cantidad };
      })
    );
  }

  function cambiarPrecio(id: string, precioArs: number) {
    setCarrito((prev) => prev.map((it) => (it.id === id ? { ...it, precioUnitarioArs: precioArs } : it)));
  }

  function cambiarTipoPrecio(id: string, tipo: TipoPrecioLinea) {
    setCarrito((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const precioBaseOriginal =
          tipo === "MAYORISTA" && it.producto.precioMayorista != null
            ? it.producto.precioMayorista
            : it.producto.precioVenta;
        return {
          ...it,
          tipoPrecio: tipo,
          precioUnitarioArs: toArs(precioBaseOriginal, it.producto.monedaPrecio),
        };
      })
    );
  }

  function eliminarItem(id: string) {
    setCarrito((prev) => prev.filter((it) => it.id !== id));
  }

  function armarInput() {
    return {
      clienteId: cliente?.id ?? null,
      items: carrito.map((it) => ({
        productoId: it.producto.id,
        cantidad: it.cantidad,
        precioUnitarioArs: it.precioUnitarioArs,
        tipoPrecio: it.tipoPrecio,
        presentacion: it.presentacion,
        abrioFrascoCerrado: it.abrioFrascoCerrado,
      })),
      pagos: pagos.map((p) => ({ cuentaId: p.cuentaId as number, monto: p.monto })),
      descuentoMonto: descuento?.tipo === "MONTO" ? descuento.valor : null,
      descuentoPorcentaje: descuento?.tipo === "PORCENTAJE" ? descuento.valor : null,
      totalARS: total,
      cotizacionUSD: 0, // se completa abajo
      presupuestoId: presupuestoIdOrigen,
    };
  }

  function limpiarVenta() {
    setCarrito([]);
    setDescuento(null);
    setPagos([{ id: "pago-unica", cuentaId: null, monto: 0 }]);
    setModoCobro("UNICA");
    setCliente(null);
    setPresupuestoIdOrigen(null);
  }

  async function handleConfirmarVenta() {
    if (carrito.length === 0) {
      toast.error("El carrito está vacío.");
      return;
    }
    if (modoCobro !== "A_CUENTA" && Math.abs(pagos.reduce((a, p) => a + p.monto, 0) - total) > 0.01) {
      toast.error("El monto cobrado no coincide con el total. Revisá el cobro.");
      return;
    }
    setProcesando(true);
    const cotizacionRes = await fetch("/api/configuracion").then((r) => r.json());
    const resultado = await confirmarVenta({ ...armarInput(), cotizacionUSD: cotizacionRes.cotizacionUSD ?? 0 });
    setProcesando(false);

    if (!resultado.success) {
      toast.error(resultado.error);
      return;
    }
    toast.success(`Venta #${resultado.ventaId} confirmada`);
    limpiarVenta();
  }

  async function handleRegistrarPedido() {
    if (carrito.length === 0) {
      toast.error("El carrito está vacío.");
      return;
    }
    setProcesando(true);
    const cotizacionRes = await fetch("/api/configuracion").then((r) => r.json());
    const resultado = await registrarPedido({ ...armarInput(), cotizacionUSD: cotizacionRes.cotizacionUSD ?? 0 });
    setProcesando(false);

    if (!resultado.success) {
      toast.error(resultado.error);
      return;
    }
    toast.success(`Pedido #${resultado.ventaId} registrado`);
    limpiarVenta();
  }

  return (
    <div className="space-y-4 p-6">
      {presupuestoIdOrigen != null && (
        <div className="rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-text">
          Convirtiendo el presupuesto #{presupuestoIdOrigen} — revisá los datos antes de confirmar.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
        <BuscadorCliente />
        <BuscadorProducto onSeleccionar={agregarProducto} />
        <TogglePrecio />

        <button
          type="button"
          onClick={() => setModalPrecioAbierto(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:bg-surface-hover"
        >
          <Tag size={14} /> Consultar precio
        </button>
      </div>

      <TablaCarrito
        items={carrito}
        onCambiarCantidad={cambiarCantidad}
        onCambiarPrecio={cambiarPrecio}
        onCambiarTipoPrecio={cambiarTipoPrecio}
        onEliminar={eliminarItem}
      />

      {carrito.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr_auto]">
            <SelectorCobro
              total={total}
              tieneCliente={cliente != null}
              modo={modoCobro}
              pagos={pagos}
              onCambiarModo={setModoCobro}
              onCambiarPagos={setPagos}
            />
            <ResumenVenta
              subtotal={subtotal}
              descuento={descuento}
              onAbrirDescuento={() => setModalDescuentoAbierto(true)}
            />
            <div className="flex flex-col justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmarVenta}
                disabled={procesando}
                className="rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {procesando ? "Procesando..." : "Confirmar venta"}
              </button>
              <button
                type="button"
                onClick={handleRegistrarPedido}
                disabled={procesando}
                className="rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                Registrar pedido
              </button>
            </div>
          </div>
        </div>
      )}
      {modalPresentacionAbierto && productoParaPresentacion && (
        <ModalPresentacion
          producto={productoParaPresentacion}
          onElegir={handleElegirPresentacion}
          onClose={() => {
            setModalPresentacionAbierto(false);
            setProductoParaPresentacion(null);
          }}
        />
      )}
      {modalPrecioAbierto && <ModalConsultarPrecio onClose={() => setModalPrecioAbierto(false)} />}
      {modalDescuentoAbierto && (
        <ModalDescuento
          descuentoActual={descuento}
          onAplicar={setDescuento}
          onClose={() => setModalDescuentoAbierto(false)}
        />
      )}
    </div>
    
  );
}