import { prisma } from "@/lib/prisma";

export type ClienteConDeuda = {
  id: string;
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
};

export async function getClientesData(filtros: ClientesFiltros = {}) {
  const clientesAll = await prisma.cliente.findMany({
    orderBy: { nombre: "asc" },
  });

  const conDeuda: ClienteConDeuda[] = clientesAll.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    apellido: c.apellido,
    telefono: c.telefono,
    email: c.email,
    direccion: c.direccion,
    localidad: c.localidad,
    esMayorista: c.esMayorista,
    deuda: 0, //placeholder hasta que se muestre el calculo real
  }));

  const resumen = {
    totalClientes: conDeuda.length,
    totalMayoristas: conDeuda.filter((c) => c.esMayorista).length,
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

  return { clientes: filtrados, resumen };
}