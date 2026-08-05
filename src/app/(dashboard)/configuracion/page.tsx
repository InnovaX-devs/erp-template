import { obtenerConfiguracion } from "@/lib/configuracion";
import { guardarConfiguracion } from "./actions";
import Image from "next/image";

export default async function ConfiguracionPage() {
  const configuracion = await obtenerConfiguracion();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <form action={guardarConfiguracion} className="space-y-6">
        {/* Nombre del negocio */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre del negocio
          </label>
          <input
            type="text"
            name="nombreNegocio"
            defaultValue={configuracion.nombreNegocio}
            required
            className="w-full border rounded p-2"
          />
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium mb-2">Logo</label>
          {configuracion.logoUrl && (
            <Image
              src={configuracion.logoUrl}
              alt="Logo actual"
              width={100}
              height={100}
              priority
              className="mb-3 rounded border object-contain"
            />
          )}
          <input
            type="file"
            name="logo"
            accept="image/png, image/jpeg"
            className="block w-full text-sm border rounded p-2"
          />
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Teléfono / WhatsApp
            </label>
            <input
              type="text"
              name="telefono"
              defaultValue={configuracion.telefono ?? ""}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={configuracion.email ?? ""}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input
              type="text"
              name="direccion"
              defaultValue={configuracion.direccion ?? ""}
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        {/* Cotización USD */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Cotización USD
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              name="cotizacionUSD"
              defaultValue={configuracion.cotizacionUSD}
              step="0.01"
              min="0"
              required
              className="w-full border rounded p-2 pl-7"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Usada para convertir precios en USD a ARS en todo el sistema.
          </p>
        </div>
        
        {/* Datos del remitente */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Datos del remitente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre y apellido
              </label>
              <input
                type="text"
                name="remitenteNombre"
                defaultValue={configuracion.remitenteNombre ?? ""}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">DNI</label>
              <input
                type="text"
                name="remitenteDni"
                defaultValue={configuracion.remitenteDni ?? ""}
                className="w-full border rounded p-2"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="costoPromedioPonderado"
              defaultChecked={configuracion.costoPromedioPonderado}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium">
              Costo promedio ponderado
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Al confirmar una compra, el costo del producto se recalcula
            mezclando el stock anterior con el nuevo. Ejemplo: 10 unidades a
            $1000 + 5 nuevas a $1200 → el costo pasa a $1066.
          </p>
        </div>

        <button
          type="submit"
          className="bg-black text-white rounded px-4 py-2 hover:bg-gray-800"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}