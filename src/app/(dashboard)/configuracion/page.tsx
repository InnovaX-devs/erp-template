import { obtenerConfiguracion } from "@/lib/configuracion";
import { ConfiguracionForm } from "@/components/configuracion/configuracion-form";

export default async function ConfiguracionPage() {
  const configuracion = await obtenerConfiguracion();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">Configuración</h1>
        <p className="text-sm text-text-dim">
          Datos generales del negocio y preferencias del sistema
        </p>
      </div>

      <ConfiguracionForm configuracion={configuracion} />
    </div>
  );
}