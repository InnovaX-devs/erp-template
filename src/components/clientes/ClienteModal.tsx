"use client";

import ClienteForm, { type ClienteBasico } from "./ClienteForm";

export default function ClienteModal({
  onCreated,
  onClose,
}: {
  onCreated: (cliente: ClienteBasico) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold text-[#191c1e] mb-4">
          Nuevo cliente
        </h2>
        <ClienteForm onSuccess={onCreated} onCancel={onClose} />
      </div>
    </div>
  );
}