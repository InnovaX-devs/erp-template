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