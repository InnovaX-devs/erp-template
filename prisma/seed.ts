import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Permite parametrizar el usuario admin por empresa/deploy vía variables
  // de entorno, en vez de tener un email fijo hardcodeado en el código.
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const nombreNegocio = process.env.NOMBRE_NEGOCIO ?? "Mi negocio";

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
      cotizacionUSD: 0,
    },
  });

  console.log("Usuario admin creado/verificado:", admin.email);
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn(
      "⚠️  Estás usando credenciales por defecto. Definí ADMIN_EMAIL y ADMIN_PASSWORD antes de correr el seed en un cliente nuevo."
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