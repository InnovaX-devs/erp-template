import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const nuevaContrasena = process.argv[2];

  if (!nuevaContrasena) {
    console.error("Uso: npm run reset-password -- <nueva-contraseña>");
    process.exit(1);
  }

  if (nuevaContrasena.length < 8) {
    console.error("La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const usuario = await prisma.usuario.findFirst({
    where: { activo: true },
    orderBy: { createdAt: "asc" },
  });

  if (!usuario) {
    console.error("No se encontró ningún usuario activo en la base.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(nuevaContrasena, 10);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { passwordHash },
  });

  console.log(`✅ Contraseña actualizada para ${usuario.email} (${usuario.nombre}).`);
}

main()
  .catch((err) => {
    console.error("Error al resetear la contraseña:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());