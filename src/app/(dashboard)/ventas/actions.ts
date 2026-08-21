"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { EstadoPago, TipoPrecioVenta } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type {
  FiltrosVentas,
  ResultadoListadoVentas,
  VentaListItem,
  FiltrosPedidos,
  ResultadoListadoPedidos,
  PedidoListItem,
} from "@/types/venta"; 

type ItemInput = {
  productoId: number;
  cantidad: number;
  precioUnitarioArs: number;
  tipoPrecio: TipoPrecioVenta;
  presentacion: "FRASCO" | "DECANT_5ML" | "DECANT_10ML";
  abrioFrascoCerrado: boolean;
};

type PagoInput = {
  cuentaId: number;
  monto: number;
};

type VentaInput = {
  clienteId: number | null;
  items: ItemInput[];
  pagos: PagoInput[];
  descuentoMonto: number | null;
  descuentoPorcentaje: number | null;
  totalARS: number;
  cotizacionUSD: number;
  presupuestoId?: number | null; // presente solo cuando la venta viene de "Convertir a venta"
};

type ResultadoVenta =
  | { success: true; ventaId: number }
  | { success: false; error: string };

  type DescontarStockItemInput = {
  productoId: number;
  cantidad: number;
  presentacion: "FRASCO" | "DECANT_5ML" | "DECANT_10ML";
  abrioFrascoCerrado: boolean;
};

type ResultadoDescontarStock =
  | { success: true }
  | { success: false; error: string };

export async function descontarStockSinVenta(
  items: DescontarStockItemInput[]
): Promise<ResultadoDescontarStock> {
  if (items.length === 0) {
    return { success: false, error: "El carrito está vacío." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Validar stock (misma regla que ventas: FRASCO descuenta cantidad completa,
      //    DECANT solo si se abrió un frasco cerrado)
      for (const item of items) {
        const unidades =
          item.presentacion === "FRASCO" ? item.cantidad : item.abrioFrascoCerrado ? 1 : 0;
        if (unidades === 0) continue;

        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          select: { stockActual: true, nombre: true },
        });
        if (!producto || producto.stockActual < unidades) {
          throw new Error(
            `Stock insuficiente para "${producto?.nombre ?? "producto"}" (disponible: ${producto?.stockActual ?? 0})`
          );
        }
      }

      // 2. Descontar. Nada más: no se crea venta, ni pedido, ni movimiento de caja.
      for (const item of items) {
        const unidades =
          item.presentacion === "FRASCO" ? item.cantidad : item.abrioFrascoCerrado ? 1 : 0;
        if (unidades === 0) continue;

        await tx.producto.update({
          where: { id: item.productoId },
          data: { stockActual: { decrement: unidades } },
        });
      }
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    console.error(e);
    const mensaje = e instanceof Error ? e.message : "Ocurrió un error al descontar el stock.";
    return { success: false, error: mensaje };
  }
}

async function crearVentaInterna(input: VentaInput, armado: boolean): Promise<ResultadoVenta> {
  if (input.items.length === 0) {
    return { success: false, error: "El carrito está vacío." };
  }

  const pagosValidos = input.pagos.filter((p) => p.cuentaId != null && p.monto > 0);
  const montoPagado = pagosValidos.reduce((acc, p) => acc + p.monto, 0);

  let estadoPago: EstadoPago;
  if (montoPagado >= input.totalARS - 0.01) {
    estadoPago = "PAGADA";
  } else {
    // Pago parcial: necesitamos cliente para poder trackear la deuda.
    if (!input.clienteId) {
      return {
        success: false,
        error: "Para dejar un saldo pendiente hace falta seleccionar un cliente.",
      };
    }
    estadoPago = "A_CUENTA";
  }

  const cotizacionUsada = input.cotizacionUSD > 0 ? input.cotizacionUSD : 1;
  const totalUSD = input.totalARS / cotizacionUsada;

  try {
    const ventaId = await prisma.$transaction(async (tx) => {
      // 0. Si viene de un presupuesto, revalidar que siga siendo convertible
      //    (nadie lo convirtió en otra pestaña, y no venció mientras el
      //    usuario armaba el cobro).
      if (input.presupuestoId != null) {
        const presupuesto = await tx.presupuesto.findUnique({
          where: { id: input.presupuestoId },
          select: { estado: true, fechaVencimiento: true },
        });

        if (!presupuesto) {
          throw new Error("El presupuesto de origen ya no existe.");
        }
        if (presupuesto.estado !== "BORRADOR") {
          throw new Error("Este presupuesto ya fue convertido o ya no es un borrador.");
        }
        if (presupuesto.fechaVencimiento < new Date()) {
          throw new Error("Este presupuesto venció, no se puede convertir.");
        }
      }

      // 1. Validar y descontar stock
      // FRASCO: descuenta `cantidad` unidades. DECANT con "abrioFrascoCerrado": descuenta 1 unidad fija
      // (se abrió un solo frasco físico, sin importar cuántos decants salgan de ahí).
      //
      // Solo se descuenta acá si "armado" es true (venta confirmada directa,
      // sin pasar por el Kanban). Si es un pedido (armado=false), el stock
      // se reserva recién en la issue #52 cuando el pedido se marca "Armado"
      // desde el tablero — así dos vendedores no pueden vender el mismo
      // stock mientras el pedido está "por armar".
      if (armado) {
        for (const item of input.items) {
          const unidadesADescontar = item.presentacion === "FRASCO" ? item.cantidad : item.abrioFrascoCerrado ? 1 : 0;
          if (unidadesADescontar === 0) continue;

          const producto = await tx.producto.findUnique({
            where: { id: item.productoId },
            select: { stockActual: true, nombre: true },
          });
          if (!producto || producto.stockActual < unidadesADescontar) {
            throw new Error(
              `Stock insuficiente para "${producto?.nombre ?? "producto"}" (disponible: ${producto?.stockActual ?? 0})`
            );
          }
        }

        for (const item of input.items) {
          const unidadesADescontar = item.presentacion === "FRASCO" ? item.cantidad : item.abrioFrascoCerrado ? 1 : 0;
          if (unidadesADescontar === 0) continue;

          await tx.producto.update({
            where: { id: item.productoId },
            data: { stockActual: { decrement: unidadesADescontar } },
          });
        }
      }

      // 2. Crear la venta + ítems
      const venta = await tx.venta.create({
        data: {
          clienteId: input.clienteId,
          presupuestoId: input.presupuestoId ?? null,
          cotizacionUsada,
          descuentoMonto: input.descuentoMonto,
          descuentoPorcentaje: input.descuentoPorcentaje,
          totalARS: input.totalARS,
          totalUSD,
          montoPagado,
          estadoPago,
          armado,
          items: {
            create: input.items.map((item) => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitarioUSD: item.precioUnitarioArs / cotizacionUsada,
              tipoPrecio: item.tipoPrecio,
              presentacion: item.presentacion,
              abrioFrascoCerrado: item.abrioFrascoCerrado,
            })),
          },
        },
      });

            // 3. Registrar pagos + movimientos de caja
      for (const pago of pagosValidos) {
        const cuentaInfo = await tx.cuenta.findUnique({
          where: { id: pago.cuentaId },
          select: { tipo: true },
        });
        if (!cuentaInfo) throw new Error("La cuenta seleccionada no existe");

        // pago.monto llega en ARS (así arma los totales el front). Si la cuenta
        // es en USD, convertimos con la cotización usada en esta venta.
        const esCuentaUSD = cuentaInfo.tipo === "EFECTIVO_USD" || cuentaInfo.tipo === "BANCO_USD";
        const montoEnMonedaCuenta = esCuentaUSD ? pago.monto / cotizacionUsada : pago.monto;

        const cuenta = await tx.cuenta.update({
          where: { id: pago.cuentaId },
          data: { saldoActual: { increment: montoEnMonedaCuenta } },
        });

        await tx.pagoVenta.create({
          data: { ventaId: venta.id, cuentaId: pago.cuentaId, monto: montoEnMonedaCuenta },
        });

        await tx.movimientoCaja.create({
          data: {
            cuentaId: pago.cuentaId,
            tipo: "INGRESO",
            concepto: "VENTA_COBRADA",
            monto: montoEnMonedaCuenta,
            saldoResultante: cuenta.saldoActual,
            ventaId: venta.id,
          },
        });
      }

      // 4. Marcar el presupuesto de origen como CONVERTIDO.
      //    updateMany con el estado como filtro = guard atómico contra
      //    doble conversión en carrera (dos pestañas confirmando a la vez).
      if (input.presupuestoId != null) {
        const actualizado = await tx.presupuesto.updateMany({
          where: { id: input.presupuestoId, estado: "BORRADOR" },
          data: { estado: "CONVERTIDO" },
        });
        if (actualizado.count === 0) {
          throw new Error("Este presupuesto ya fue convertido en otra pestaña.");
        }
      }

      return venta.id;
    });

    revalidatePath("/", "layout");

    return { success: true, ventaId };
  } catch (e) {
    console.error(e);
    const mensaje = e instanceof Error ? e.message : "Ocurrió un error al procesar la venta.";
    return { success: false, error: mensaje };
  }
}

export async function confirmarVenta(input: VentaInput): Promise<ResultadoVenta> {
  return crearVentaInterna(input, true);
}

export async function registrarPedido(input: VentaInput): Promise<ResultadoVenta> {
  return crearVentaInterna(input, false);
}

const getConfiguracionCacheada = unstable_cache(
  async () => prisma.configuracion.findUnique({ where: { id: "singleton" } }),
  ["configuracion-singleton"],
  { revalidate: 300 } // se refresca cada 5 min
);

export async function listarVentas(filtros: FiltrosVentas): Promise<ResultadoListadoVentas> {
  const { estado, clienteTexto, fechaDesde, fechaHasta, orden, page, pageSize } = filtros;

  const where: Prisma.VentaWhereInput = {};

  if (estado !== "TODOS") {
    where.estadoPago = estado;
  }

  const texto = clienteTexto.trim();
  if (texto) {
    const soloNumeros = texto.replace(/^#/, ""); // permite escribir "8" o "#8"
    const esNumero = /^\d+$/.test(soloNumeros);

    if (esNumero) {
      where.id = Number(soloNumeros);
    } else if (texto.toLowerCase() === "sin cliente") {
      where.clienteId = null;
    } else {
      where.cliente = {
        OR: [
          { nombre: { contains: texto, mode: "insensitive" } },
          { apellido: { contains: texto, mode: "insensitive" } },
        ],
      };
    }
  }

  if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha.gte = new Date(`${fechaDesde}T00:00:00-03:00`);
      if (fechaHasta) where.fecha.lte = new Date(`${fechaHasta}T23:59:59-03:00`);
    }

  const [ventas, totalRegistros, configuracion] = await Promise.all([
    prisma.venta.findMany({
      where,
      orderBy: { fecha: orden === "MAS_NUEVO" ? "desc" : "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        cliente: { select: { nombre: true, apellido: true } },
        items: {
          include: {
            producto: { select: { precioCosto: true, monedaPrecio: true, contenidoMl: true } },
          },
        },
      },
    }),
    prisma.venta.count({ where }),
    getConfiguracionCacheada(),
  ]);

  const costoEnvaseDecantARS = configuracion?.costoEnvaseDecantARS ?? 0;

  const ventasFormateadas: VentaListItem[] = ventas.map((venta) => {
    const costoTotalARS = venta.items.reduce((acc, item) => {
      if (!item.producto) return acc;

      const costoProductoARS =
        item.producto.monedaPrecio === "USD"
          ? item.producto.precioCosto * venta.cotizacionUsada
          : item.producto.precioCosto;

      let costoItemARS: number;

      switch (item.presentacion) {
        case "FRASCO":
          costoItemARS = costoProductoARS * item.cantidad;
          break;

        case "DECANT_5ML":
        case "DECANT_10ML": {
          if (!item.producto.contenidoMl || item.producto.contenidoMl <= 0) {
            // Sin contenidoMl no se puede calcular el costo proporcional real.
            // No sumamos nada, pero esto puede inflar la ganancia mostrada
            // (queda documentado, ideal a futuro: marcar la venta como "costo incompleto").
            return acc;
          }

          const ml = item.presentacion === "DECANT_5ML" ? 5 : 10;
          const costoPerfumeARS = (costoProductoARS / item.producto.contenidoMl) * ml;
          costoItemARS = (costoPerfumeARS + costoEnvaseDecantARS) * item.cantidad;
          break;
        }

        default:
          costoItemARS = 0;
      }

      return acc + costoItemARS;
    }, 0);

    const gananciaARS = venta.totalARS - costoTotalARS;
    const gananciaPorcentaje = costoTotalARS > 0 ? (gananciaARS / costoTotalARS) * 100 : 0;

    return {
      id: venta.id,
      clienteNombre: venta.cliente
        ? `${venta.cliente.nombre}${venta.cliente.apellido ? " " + venta.cliente.apellido : ""}`
        : null,
      totalARS: venta.totalARS,
      gananciaARS,
      gananciaPorcentaje,
      fecha: venta.fecha.toISOString(),
      estado: venta.estadoPago,
    };
  });

  return { ventas: ventasFormateadas, totalRegistros };
}

export type StockDisponibilidad = {
  stockFisico: number;
  reservado: number;
  disponible: number;
  alcanza: boolean;
};

export async function verificarStockDisponible(
  productoId: number,
  unidadesRequeridas: number
): Promise<StockDisponibilidad> {
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    select: { stockActual: true },
  });
  const stockFisico = producto?.stockActual ?? 0;

  // Reservado = suma de unidades comprometidas en pedidos sin armar (armado=false)
  // que siguen activos (ni cancelados ni anulados). Usa la misma regla que
  // el descuento real: FRASCO cuenta la cantidad completa; DECANT solo
  // cuenta si abrió un frasco cerrado (abrioFrascoCerrado=true).
  const itemsPendientes = await prisma.itemVenta.findMany({
    where: {
      productoId,
      venta: {
        armado: false,
        estadoPago: { notIn: ["CANCELADA", "ANULADA"] },
      },
    },
    select: { cantidad: true, presentacion: true, abrioFrascoCerrado: true },
  });

  const reservado = itemsPendientes.reduce((acc, item) => {
    const unidades =
      item.presentacion === "FRASCO" ? item.cantidad : item.abrioFrascoCerrado ? 1 : 0;
    return acc + unidades;
  }, 0);

  const disponible = stockFisico - reservado;

  return {
    stockFisico,
    reservado,
    disponible,
    alcanza: unidadesRequeridas <= disponible,
  };
}

export async function listarPedidos(filtros: FiltrosPedidos): Promise<ResultadoListadoPedidos> {
  const { clienteTexto, fechaDesde, fechaHasta, orden, sinCobrar, sinArmar, sinEnviar, sinRetirar } = filtros;

  const where: Prisma.VentaWhereInput = {
    retirado: false,
    estadoPago: { notIn: ["CANCELADA", "ANULADA"] },
  };

  if (sinCobrar) where.estadoPago = "A_CUENTA";
  if (sinArmar) where.armado = false;
  if (sinEnviar) where.enviado = false;
  if (sinRetirar) where.retirado = false; // ya está arriba, pero explícito por claridad de filtro activo

  const texto = clienteTexto.trim();
  if (texto) {
    const soloNumeros = texto.replace(/^#/, "");
    const esNumero = /^\d+$/.test(soloNumeros);

    if (esNumero) {
      where.id = Number(soloNumeros);
    } else if (texto.toLowerCase() === "sin cliente") {
      where.clienteId = null;
    } else {
      where.cliente = {
        OR: [
          { nombre: { contains: texto, mode: "insensitive" } },
          { apellido: { contains: texto, mode: "insensitive" } },
        ],
      };
    }
  }

  if (fechaDesde || fechaHasta) {
    where.fecha = {};
    if (fechaDesde) where.fecha.gte = new Date(`${fechaDesde}T00:00:00-03:00`);
    if (fechaHasta) where.fecha.lte = new Date(`${fechaHasta}T23:59:59-03:00`);
  }

  const ventas = await prisma.venta.findMany({
    where,
    orderBy: { fecha: orden === "MAS_NUEVO" ? "desc" : "asc" },
    include: {
      cliente: { select: { nombre: true, apellido: true } },
    },
  });

  const pedidos: PedidoListItem[] = ventas.map((venta) => ({
    id: venta.id,
    clienteNombre: venta.cliente
      ? `${venta.cliente.nombre}${venta.cliente.apellido ? " " + venta.cliente.apellido : ""}`
      : null,
    totalARS: venta.totalARS,
    montoPagado: venta.montoPagado,
    estadoPago: venta.estadoPago,
    armado: venta.armado,
    enviado: venta.enviado,
    retirado: venta.retirado,
    fecha: venta.fecha.toISOString(),
  }));

  return { pedidos };
}

type ResultadoAccionPedido = { success: true } | { success: false; error: string };

export async function marcarArmado(ventaId: number): Promise<ResultadoAccionPedido> {
  try {
    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: { items: true },
    });
    if (!venta) return { success: false, error: "El pedido no existe" };
    if (venta.armado) return { success: false, error: "El pedido ya está armado" };

    await prisma.$transaction(async (tx) => {
      // Misma regla de descuento que crearVentaInterna: FRASCO descuenta
      // cantidad completa; DECANT solo si abrió un frasco cerrado.
      for (const item of venta.items) {
        const unidadesADescontar =
          item.presentacion === "FRASCO" ? item.cantidad : item.abrioFrascoCerrado ? 1 : 0;
        if (unidadesADescontar === 0) continue;

        const producto = await tx.producto.findUnique({
          where: { id: item.productoId! },
          select: { stockActual: true, nombre: true },
        });
        if (!producto || producto.stockActual < unidadesADescontar) {
          throw new Error(
            `Stock insuficiente para "${producto?.nombre ?? "producto"}" (disponible: ${producto?.stockActual ?? 0})`
          );
        }
      }

      for (const item of venta.items) {
        const unidadesADescontar =
          item.presentacion === "FRASCO" ? item.cantidad : item.abrioFrascoCerrado ? 1 : 0;
        if (unidadesADescontar === 0) continue;

        await tx.producto.update({
          where: { id: item.productoId! },
          data: { stockActual: { decrement: unidadesADescontar } },
        });
      }

      await tx.venta.update({ where: { id: ventaId }, data: { armado: true } });
    });

    revalidatePath("/ventas/pedidos");
    return { success: true };
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : "Error al marcar como armado";
    return { success: false, error: mensaje };
  }
}

export async function marcarEnviado(ventaId: number): Promise<ResultadoAccionPedido> {
  try {
    const venta = await prisma.venta.findUnique({ where: { id: ventaId } });
    if (!venta) return { success: false, error: "El pedido no existe" };
    if (!venta.armado) return { success: false, error: "El pedido todavía no fue armado" };

    await prisma.venta.update({ where: { id: ventaId }, data: { enviado: true } });
    revalidatePath("/ventas/pedidos");
    return { success: true };
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : "Error al marcar como enviado";
    return { success: false, error: mensaje };
  }
}

export async function marcarRetirado(ventaId: number): Promise<ResultadoAccionPedido> {
  try {
    const venta = await prisma.venta.findUnique({ where: { id: ventaId } });
    if (!venta) return { success: false, error: "El pedido no existe" };
    if (!venta.armado) return { success: false, error: "El pedido todavía no fue armado" };

    await prisma.venta.update({ where: { id: ventaId }, data: { retirado: true } });
    revalidatePath("/ventas/pedidos");
    return { success: true };
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : "Error al marcar como retirado";
    return { success: false, error: mensaje };
  }
}

export async function registrarCobroPedido(
  ventaId: number,
  pagos: { cuentaId: number; monto: number }[]
): Promise<ResultadoAccionPedido> {
  const pagosValidos = pagos.filter((p) => p.cuentaId != null && p.monto > 0);
  if (pagosValidos.length === 0) {
    return { success: false, error: "Ingresá al menos un pago válido" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const venta = await tx.venta.findUnique({ where: { id: ventaId } });
      if (!venta) throw new Error("El pedido no existe");
      if (venta.estadoPago === "PAGADA") throw new Error("El pedido ya está pagado");

      const configuracion = await tx.configuracion.findUnique({ where: { id: "singleton" } });
      const cotizacion = configuracion?.cotizacionUSD && configuracion.cotizacionUSD > 0
        ? configuracion.cotizacionUSD
        : 1;

      // montoNuevo y restante siguen en ARS: así es como está expresado totalARS/montoPagado del pedido.
      const montoNuevo = pagosValidos.reduce((acc, p) => acc + p.monto, 0);
      const restante = venta.totalARS - venta.montoPagado;

      if (montoNuevo > restante + 0.01) {
        throw new Error(
          `El monto ingresado ($${montoNuevo.toFixed(2)}) supera lo que falta cobrar ($${restante.toFixed(2)})`
        );
      }

      for (const pago of pagosValidos) {
        const cuentaInfo = await tx.cuenta.findUnique({
          where: { id: pago.cuentaId },
          select: { tipo: true },
        });
        if (!cuentaInfo) throw new Error("La cuenta seleccionada no existe");

        const esCuentaUSD = cuentaInfo.tipo === "EFECTIVO_USD" || cuentaInfo.tipo === "BANCO_USD";
        const montoEnMonedaCuenta = esCuentaUSD ? pago.monto / cotizacion : pago.monto;

        const cuenta = await tx.cuenta.update({
          where: { id: pago.cuentaId },
          data: { saldoActual: { increment: montoEnMonedaCuenta } },
        });

        await tx.pagoVenta.create({
          data: { ventaId, cuentaId: pago.cuentaId, monto: montoEnMonedaCuenta },
        });

        await tx.movimientoCaja.create({
          data: {
            cuentaId: pago.cuentaId,
            tipo: "INGRESO",
            concepto: "VENTA_COBRADA",
            monto: montoEnMonedaCuenta,
            saldoResultante: cuenta.saldoActual,
            ventaId,
          },
        });
      }

      const nuevoMontoPagado = venta.montoPagado + montoNuevo;
      const nuevoEstado: EstadoPago = nuevoMontoPagado >= venta.totalARS - 0.01 ? "PAGADA" : "A_CUENTA";

      if (nuevoEstado === "A_CUENTA" && !venta.clienteId) {
        throw new Error("Para dejar un saldo pendiente el pedido necesita un cliente asociado.");
      }

      await tx.venta.update({
        where: { id: ventaId },
        data: { montoPagado: nuevoMontoPagado, estadoPago: nuevoEstado },
      });
    });

    revalidatePath("/ventas/pedidos");
    return { success: true };
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : "Error al registrar el cobro";
    return { success: false, error: mensaje };
  }
}