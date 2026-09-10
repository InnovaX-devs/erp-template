import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Convierte "true"/"1" en true; cualquier otra cosa (incluido undefined) en
// false. Así el default de cada flag de módulo queda explícitamente false
// si no se define nada en el .env.
function envBool(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

async function main() {
  // Permite parametrizar el alta de un cliente nuevo por variables de
  // entorno, en vez de tener que cargar todo a mano desde Prisma Studio.
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const nombreNegocio = process.env.NOMBRE_NEGOCIO ?? "Mi negocio";

  // Sin esto en 0, cualquier producto cargado en USD divide por cero al
  // convertir a ARS (ver lib/currency.ts) y el sistema queda inutilizable
  // hasta que alguien lo corrija a mano en Configuración.
  const cotizacionUSD = process.env.COTIZACION_USD
    ? Number(process.env.COTIZACION_USD)
    : 1000;

  // Flags de módulos opcionales por cliente. Se arma como objeto para poder
  // sumar más flags a futuro sin tocar la firma de la función.
  const flagsModulos = {
    moduloDecantHabilitado: envBool(process.env.MODULO_DECANT_HABILITADO),
  };

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: {
      nombre: "Administrador",
      email,
      passwordHash,
      activo: true,
    },
  });

  await prisma.configuracion.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nombreNegocio,
      cotizacionUSD,
      ...flagsModulos,
    },
  });

  console.log("Usuario admin creado/verificado:", admin.email);
  console.log("Configuración inicial:", { nombreNegocio, cotizacionUSD, ...flagsModulos });

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn(
      "⚠️  Estás usando credenciales por defecto. Definí ADMIN_EMAIL y ADMIN_PASSWORD antes de correr el seed en un cliente nuevo."
    );
  }
  if (!process.env.COTIZACION_USD) {
    console.warn(
      "⚠️  Cotización USD sin definir, quedó en 1000 por defecto. Corregila en Configuración antes de cargar productos en dólares."
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
