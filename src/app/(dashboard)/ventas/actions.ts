"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { EstadoPago, TipoPrecioVenta } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { FiltrosVentas, ResultadoListadoVentas, VentaListItem } from "@/types/venta";  

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
        const cuenta = await tx.cuenta.update({
          where: { id: pago.cuentaId },
          data: { saldoActual: { increment: pago.monto } },
        });

        await tx.pagoVenta.create({
          data: { ventaId: venta.id, cuentaId: pago.cuentaId, monto: pago.monto },
        });

        await tx.movimientoCaja.create({
          data: {
            cuentaId: pago.cuentaId,
            tipo: "INGRESO",
            concepto: "VENTA_COBRADA",
            monto: pago.monto,
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
    if (fechaDesde) where.fecha.gte = new Date(`${fechaDesde}T00:00:00`);
    if (fechaHasta) where.fecha.lte = new Date(`${fechaHasta}T23:59:59`);
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
    prisma.configuracion.findUnique({ where: { id: "singleton" } }),
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