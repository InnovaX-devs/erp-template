-- CreateEnum
CREATE TYPE "Licencia" AS ENUM ('BASICO', 'PREMIUM');

-- AlterTable
ALTER TABLE "Configuracion" ADD COLUMN     "licencia" "Licencia" NOT NULL DEFAULT 'BASICO';
