"use client";

import { useRouter } from "next/navigation";
import ClienteForm from "@/components/clientes/ClienteForm";

export default function NuevoClientePage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-semibold text-[#191c1e] mb-6">Nuevo cliente</h1>
      <ClienteForm onSuccess={() => router.push("/clientes")} />
    </div>
  );
}