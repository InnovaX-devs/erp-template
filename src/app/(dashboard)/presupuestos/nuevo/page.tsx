import PresupuestoForm from "../PresupuestoForm";
import Link from "next/link";

export default function NuevoPresupuestoPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-[#191c1e]">Nuevo Presupuesto</h1>
        <Link href="/presupuestos" className="text-sm text-[#021541]">
          ← Volver a la lista
        </Link>
      </div>
      <PresupuestoForm />
    </div>
  );
}