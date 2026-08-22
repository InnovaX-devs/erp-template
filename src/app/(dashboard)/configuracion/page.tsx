import { obtenerConfiguracion } from "@/lib/configuracion";
import { ConfiguracionForm } from "@/components/configuracion/configuracion-form";

export default async function ConfiguracionPage() {
  const configuracion = await obtenerConfiguracion();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ConfiguracionForm configuracion={configuracion} />
    </div>
  );
}