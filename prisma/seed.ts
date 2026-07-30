import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("changeme123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@kjperfumes.com" },
    update: {},
    create: {
      nombre: "Administrador",
      email: "admin@kjperfumes.com",
      passwordHash,
      activo: true,
    },
  });

  console.log("Usuario admin creado/verificado:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });