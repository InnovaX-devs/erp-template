/*
  Warnings:

  - You are about to drop the column `tipoPago` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `costoUnitario` on the `ItemCompra` table. All the data in the column will be lost.
  - Added the required column `cuentaId` to the `Compra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalUSD` to the `Compra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costoUnitarioUSD` to the `ItemCompra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Compra" DROP COLUMN "tipoPago",
DROP COLUMN "total",
ADD COLUMN     "cotizacionUsada" DOUBLE PRECISION,
ADD COLUMN     "cuentaId" INTEGER NOT NULL,
ADD COLUMN     "totalARS" DOUBLE PRECISION,
ADD COLUMN     "totalUSD" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "ItemCompra" DROP COLUMN "costoUnitario",
ADD COLUMN     "costoUnitarioUSD" DOUBLE PRECISION NOT NULL;

-- DropEnum
DROP TYPE "TipoPagoCompra";

-- CreateIndex
CREATE INDEX "Compra_cuentaId_idx" ON "Compra"("cuentaId");

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
