"use client";

import { useRouter } from "next/navigation";
import ClienteForm from "@/components/clientes/ClienteForm";

export default function EditarClienteClient({
  cliente,
}: {
  cliente: {
    id: string;
    nombre: string;
    apellido: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    localidad: string | null;
    esMayorista: boolean;
  };
}) {
  const router = useRouter();

  return (
    <ClienteForm
      clienteInicial={{
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido ?? "",
        telefono: cliente.telefono ?? "",
        email: cliente.email ?? "",
        direccion: cliente.direccion ?? "",
        localidad: cliente.localidad ?? "",
        esMayorista: cliente.esMayorista,
      }}
      onSuccess={() => router.push("/clientes")}
    />
  );
}