/*
  Warnings:

  - A unique constraint covering the columns `[presupuestoId]` on the table `Venta` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "presupuestoId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Venta_presupuestoId_key" ON "Venta"("presupuestoId");

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
