import { prisma } from "@/lib/prisma";

export type ClienteConDeuda = {
  id: number;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  localidad: string | null;
  esMayorista: boolean;
  deuda: number;
};

export type OrdenClientes = "nombre-asc" | "nombre-desc" | "deuda-desc" | "deuda-asc";

export type ClientesFiltros = {
  busqueda?: string;
  tipo?: "mayorista" | "minorista";
  deuda?: "con-deuda" | "al-dia";
  orden?: OrdenClientes;
  pagina?: number;
};

export type Paginacion = {
  pagina: number;
  totalPaginas: number;
  totalItems: number;
  pageSize: number;
};

const UMBRAL_AL_DIA = 0.01;
const PAGE_SIZE = 25;

export async function getClientesData(filtros: ClientesFiltros = {}) {
  const clientesAll = await prisma.cliente.findMany({
    orderBy: { nombre: "asc" },
    include: {
      ventas: {
        where: { estadoPago: "A_CUENTA" },
        select: { totalARS: true, montoPagado: true },
      },
    },
  });

  const conDeuda: ClienteConDeuda[] = clientesAll.map((c) => {
    const deuda = c.ventas.reduce(
      (sum, v) => sum + Math.max(0, v.totalARS - v.montoPagado),
      0
    );
    return {
      id: c.id,
      nombre: c.nombre,
      apellido: c.apellido,
      telefono: c.telefono,
      email: c.email,
      direccion: c.direccion,
      localidad: c.localidad,
      esMayorista: c.esMayorista,
      deuda: Math.round(deuda * 100) / 100,
    };
  });

  const resumen = {
    totalClientes: conDeuda.length,
    totalMayoristas: conDeuda.filter((c) => c.esMayorista).length,
    deudaTotal: conDeuda.reduce((sum, c) => sum + c.deuda, 0),
  };

  let filtrados = conDeuda;

  if (filtros.busqueda) {
    const q = filtros.busqueda.toLowerCase();
    filtrados = filtrados.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.apellido?.toLowerCase().includes(q) ?? false)
    );
  }

  if (filtros.tipo) {
    filtrados = filtrados.filter((c) =>
      filtros.tipo === "mayorista" ? c.esMayorista : !c.esMayorista
    );
  }

  if (filtros.deuda === "con-deuda") {
    filtrados = filtrados.filter((c) => c.deuda > UMBRAL_AL_DIA);
  } else if (filtros.deuda === "al-dia") {
    filtrados = filtrados.filter((c) => c.deuda <= UMBRAL_AL_DIA);
  }

  const orden = filtros.orden ?? "nombre-asc";
  filtrados = [...filtrados].sort((a, b) => {
    const nombreA = `${a.nombre} ${a.apellido ?? ""}`.trim();
    const nombreB = `${b.nombre} ${b.apellido ?? ""}`.trim();
    switch (orden) {
      case "nombre-desc":
        return nombreB.localeCompare(nombreA);
      case "deuda-desc":
        return b.deuda - a.deuda;
      case "deuda-asc":
        return a.deuda - b.deuda;
      case "nombre-asc":
      default:
        return nombreA.localeCompare(nombreB);
    }
  });

  const totalItems = filtrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginaSolicitada = filtros.pagina ?? 1;
  const pagina = Math.min(Math.max(1, paginaSolicitada), totalPaginas);

  const inicio = (pagina - 1) * PAGE_SIZE;
  const clientesPagina = filtrados.slice(inicio, inicio + PAGE_SIZE);

  const paginacion: Paginacion = {
    pagina,
    totalPaginas,
    totalItems,
    pageSize: PAGE_SIZE,
  };

  return { clientes: clientesPagina, resumen, umbralAlDia: UMBRAL_AL_DIA, paginacion };
}

export async function getCuentasActivas() {
  return prisma.cuenta.findMany({
    where: { activa: true },
    orderBy: [{ favorita: "desc" }, { nombre: "asc" }],
    select: { id: true, nombre: true, tipo: true, saldoActual: true },
  });
}

// --- Historial de deuda ---

export type EventoHistorialDeuda = {
  id: string;
  tipo: "venta" | "pago";
  monto: number;
  fecha: Date;
  label: string;
  sublabel: string;
  ventaId: number;
  saldoAntes: number;
  saldoDespues: number;
};

function labelMedioPago(tipoCuenta: string) {
  return tipoCuenta === "BANCO_ARS" || tipoCuenta === "BANCO_USD"
    ? "Pago vía transferencia"
    : "Pago en efectivo";
}

export async function getHistorialDeuda(clienteId: number): Promise<EventoHistorialDeuda[]> {
  const ventas = await prisma.venta.findMany({
    where: {
      clienteId,
      OR: [{ estadoPago: "A_CUENTA" }, { pagos: { some: {} } }],
    },
    include: {
      items: { select: { descripcionLibre: true } },
      pagos: { include: { cuenta: { select: { tipo: true } } } },
    },
    orderBy: { fecha: "asc" },
  });

  type EventoRaw = Omit<EventoHistorialDeuda, "id" | "saldoAntes" | "saldoDespues">;
  const eventos: EventoRaw[] = [];

  for (const venta of ventas) {
    const esAjuste =
      venta.items.length === 1 && venta.items[0].descripcionLibre === "Ajuste manual de deuda";

    eventos.push({
      fecha: venta.fecha,
      monto: venta.totalARS,
      tipo: "venta",
      label: esAjuste ? "Ajuste manual" : "Venta a cuenta",
      sublabel: esAjuste ? "Aumento de deuda" : `Venta #${venta.id}`,
      ventaId: venta.id,
    });

    for (const pago of venta.pagos) {
      eventos.push({
        fecha: pago.fecha,
        monto: -pago.monto,
        tipo: "pago",
        label: "Pago recibido",
        sublabel: labelMedioPago(pago.cuenta.tipo),
        ventaId: venta.id,
      });
    }
  }

  eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  let saldo = 0;
  const historial: EventoHistorialDeuda[] = eventos.map((e, i) => {
    const saldoAntes = Math.round(saldo * 100) / 100;
    saldo += e.monto;
    return {
      ...e,
      id: `${e.tipo}-${e.ventaId}-${i}`,
      saldoAntes,
      saldoDespues: Math.round(saldo * 100) / 100,
    };
  });

  return historial.reverse(); // más reciente primero
}