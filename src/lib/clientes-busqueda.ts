"use server";

import { prisma } from "@/lib/prisma";
import { obtenerEmpresaIdActual } from "@/lib/empresa";

export type ClienteBusquedaResult = {
  id: number;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  esMayorista: boolean;
};

export async function buscarClientesRapido(query: string): Promise<ClienteBusquedaResult[]> {
  const q = query.trim();
  if (!q) return [];

  const empresaId = await obtenerEmpresaIdActual();

  const clientes = await prisma.cliente.findMany({
    where: {
      empresaId,
      OR: [
        { nombre: { contains: q, mode: "insensitive" } },
        { apellido: { contains: q, mode: "insensitive" } },
        { telefono: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { nombre: "asc" },
    take: 10,
    select: {
      id: true,
      nombre: true,
      apellido: true,
      telefono: true,
      esMayorista: true,
    },
  });

  return clientes;
}