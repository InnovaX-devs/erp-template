-- AlterTable
ALTER TABLE "Configuracion"
  ADD COLUMN "instagram" TEXT,
  ADD COLUMN "colorPrimario" TEXT DEFAULT '#2952CC',
  ADD COLUMN "colorSecundario" TEXT DEFAULT '#0891B2',
  ADD COLUMN "ventaPorDecant" BOOLEAN NOT NULL DEFAULT false;
