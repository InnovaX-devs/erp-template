/*
  Warnings:

  - The primary key for the `Configuracion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Configuracion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[empresaId,nombre]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,nombre]` on the table `CategoriaGasto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId]` on the table `Configuracion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,nombre]` on the table `Marca` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empresaId,codigoBarras]` on the table `Producto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `empresaId` to the `Categoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `CategoriaGasto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Compra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Configuracion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Cuenta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Gasto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `HistorialPrecio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Marca` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `MovimientoCaja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Presupuesto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Proveedor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaId` to the `Venta` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Categoria_nombre_key";

-- DropIndex
DROP INDEX "CategoriaGasto_nombre_key";

-- DropIndex
DROP INDEX "Marca_nombre_key";

-- DropIndex
DROP INDEX "Producto_codigoBarras_idx";

-- DropIndex
DROP INDEX "Producto_codigoBarras_key";

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CategoriaGasto" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Compra" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Configuracion" DROP CONSTRAINT "Configuracion_pkey",
ADD COLUMN     "empresaId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Cuenta" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Gasto" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "HistorialPrecio" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Marca" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "MovimientoCaja" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Presupuesto" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "empresaId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Categoria_empresaId_idx" ON "Categoria"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_empresaId_nombre_key" ON "Categoria"("empresaId", "nombre");

-- CreateIndex
CREATE INDEX "CategoriaGasto_empresaId_idx" ON "CategoriaGasto"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaGasto_empresaId_nombre_key" ON "CategoriaGasto"("empresaId", "nombre");

-- CreateIndex
CREATE INDEX "Cliente_empresaId_idx" ON "Cliente"("empresaId");

-- CreateIndex
CREATE INDEX "Compra_empresaId_idx" ON "Compra"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracion_empresaId_key" ON "Configuracion"("empresaId");

-- CreateIndex
CREATE INDEX "Cuenta_empresaId_idx" ON "Cuenta"("empresaId");

-- CreateIndex
CREATE INDEX "Gasto_empresaId_idx" ON "Gasto"("empresaId");

-- CreateIndex
CREATE INDEX "HistorialPrecio_empresaId_idx" ON "HistorialPrecio"("empresaId");

-- CreateIndex
CREATE INDEX "Marca_empresaId_idx" ON "Marca"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Marca_empresaId_nombre_key" ON "Marca"("empresaId", "nombre");

-- CreateIndex
CREATE INDEX "MovimientoCaja_empresaId_idx" ON "MovimientoCaja"("empresaId");

-- CreateIndex
CREATE INDEX "Presupuesto_empresaId_idx" ON "Presupuesto"("empresaId");

-- CreateIndex
CREATE INDEX "Producto_empresaId_idx" ON "Producto"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_empresaId_codigoBarras_key" ON "Producto"("empresaId", "codigoBarras");

-- CreateIndex
CREATE INDEX "Proveedor_empresaId_idx" ON "Proveedor"("empresaId");

-- CreateIndex
CREATE INDEX "Usuario_empresaId_idx" ON "Usuario"("empresaId");

-- CreateIndex
CREATE INDEX "Venta_empresaId_idx" ON "Venta"("empresaId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marca" ADD CONSTRAINT "Marca_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialPrecio" ADD CONSTRAINT "HistorialPrecio_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proveedor" ADD CONSTRAINT "Proveedor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuenta" ADD CONSTRAINT "Cuenta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaGasto" ADD CONSTRAINT "CategoriaGasto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Configuracion" ADD CONSTRAINT "Configuracion_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
