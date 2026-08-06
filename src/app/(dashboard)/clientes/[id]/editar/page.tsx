import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditarClienteClient from "./EditarClienteClient";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente) notFound();

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-semibold text-[#191c1e] mb-6">Editar cliente</h1>
      <EditarClienteClient cliente={cliente} />
    </div>
  );
}