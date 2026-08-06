import { prisma } from "@/lib/prisma";

export type ClienteConDeuda = {
  id: number; // antes: string — Cliente.id es Int autoincrement
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  localidad: string | null;
  esMayorista: boolean;
  deuda: number;
};

export type ClientesFiltros = {
  busqueda?: string;
  tipo?: "mayorista" | "minorista";
  deuda?: "con-deuda" | "al-dia";
};

const UMBRAL_AL_DIA = 0.01; // tolerancia por redondeo de floats

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

  // Resumen: siempre sobre el total, no sobre lo filtrado
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

  return { clientes: filtrados, resumen, umbralAlDia: UMBRAL_AL_DIA };
}

export async function getCuentasActivas() {
  return prisma.cuenta.findMany({
    where: { activa: true },
    orderBy: [{ favorita: "desc" }, { nombre: "asc" }],
    select: { id: true, nombre: true, tipo: true, saldoActual: true },
  });
}