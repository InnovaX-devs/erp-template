/*
  Warnings:

  - The primary key for the `Categoria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Categoria` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `CategoriaGasto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `CategoriaGasto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Cliente` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Cliente` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Compra` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Compra` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `proveedorId` column on the `Compra` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Cuenta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Cuenta` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Gasto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Gasto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `categoriaId` column on the `Gasto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `proveedorId` column on the `Gasto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `HistorialPrecio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `HistorialPrecio` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ItemCompra` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ItemCompra` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ItemVenta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ItemVenta` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `productoId` column on the `ItemVenta` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Marca` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Marca` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `MovimientoCaja` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `MovimientoCaja` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ventaId` column on the `MovimientoCaja` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gastoId` column on the `MovimientoCaja` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `compraId` column on the `MovimientoCaja` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PagoVenta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PagoVenta` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Presupuesto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Presupuesto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `clienteId` column on the `Presupuesto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PresupuestoItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PresupuestoItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `productoId` column on the `PresupuestoItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Producto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Producto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `marcaId` column on the `Producto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `categoriaId` column on the `Producto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Proveedor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Proveedor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Venta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Venta` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `clienteId` column on the `Venta` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `productoId` on the `HistorialPrecio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `compraId` on the `ItemCompra` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productoId` on the `ItemCompra` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ventaId` on the `ItemVenta` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `cuentaId` on the `MovimientoCaja` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `ventaId` on the `PagoVenta` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `cuentaId` on the `PagoVenta` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `presupuestoId` on the `PresupuestoItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Compra" DROP CONSTRAINT "Compra_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "Gasto" DROP CONSTRAINT "Gasto_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "Gasto" DROP CONSTRAINT "Gasto_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "HistorialPrecio" DROP CONSTRAINT "HistorialPrecio_productoId_fkey";

-- DropForeignKey
ALTER TABLE "ItemCompra" DROP CONSTRAINT "ItemCompra_compraId_fkey";

-- DropForeignKey
ALTER TABLE "ItemCompra" DROP CONSTRAINT "ItemCompra_productoId_fkey";

-- DropForeignKey
ALTER TABLE "ItemVenta" DROP CONSTRAINT "ItemVenta_productoId_fkey";

-- DropForeignKey
ALTER TABLE "ItemVenta" DROP CONSTRAINT "ItemVenta_ventaId_fkey";

-- DropForeignKey
ALTER TABLE "MovimientoCaja" DROP CONSTRAINT "MovimientoCaja_compraId_fkey";

-- DropForeignKey
ALTER TABLE "MovimientoCaja" DROP CONSTRAINT "MovimientoCaja_cuentaId_fkey";

-- DropForeignKey
ALTER TABLE "MovimientoCaja" DROP CONSTRAINT "MovimientoCaja_gastoId_fkey";

-- DropForeignKey
ALTER TABLE "MovimientoCaja" DROP CONSTRAINT "MovimientoCaja_ventaId_fkey";

-- DropForeignKey
ALTER TABLE "PagoVenta" DROP CONSTRAINT "PagoVenta_cuentaId_fkey";

-- DropForeignKey
ALTER TABLE "PagoVenta" DROP CONSTRAINT "PagoVenta_ventaId_fkey";

-- DropForeignKey
ALTER TABLE "Presupuesto" DROP CONSTRAINT "Presupuesto_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "PresupuestoItem" DROP CONSTRAINT "PresupuestoItem_presupuestoId_fkey";

-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_marcaId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_clienteId_fkey";

-- AlterTable
ALTER TABLE "Categoria" DROP CONSTRAINT "Categoria_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CategoriaGasto" DROP CONSTRAINT "CategoriaGasto_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "CategoriaGasto_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Compra" DROP CONSTRAINT "Compra_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "proveedorId",
ADD COLUMN     "proveedorId" INTEGER,
ADD CONSTRAINT "Compra_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Configuracion" ALTER COLUMN "id" SET DEFAULT 'singleton',
ALTER COLUMN "cotizacionUSD" SET DEFAULT 1000;

-- AlterTable
ALTER TABLE "Cuenta" DROP CONSTRAINT "Cuenta_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Cuenta_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Gasto" DROP CONSTRAINT "Gasto_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "categoriaId",
ADD COLUMN     "categoriaId" INTEGER,
DROP COLUMN "proveedorId",
ADD COLUMN     "proveedorId" INTEGER,
ADD CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "HistorialPrecio" DROP CONSTRAINT "HistorialPrecio_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "productoId",
ADD COLUMN     "productoId" INTEGER NOT NULL,
ADD CONSTRAINT "HistorialPrecio_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ItemCompra" DROP CONSTRAINT "ItemCompra_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "compraId",
ADD COLUMN     "compraId" INTEGER NOT NULL,
DROP COLUMN "productoId",
ADD COLUMN     "productoId" INTEGER NOT NULL,
ADD CONSTRAINT "ItemCompra_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ItemVenta" DROP CONSTRAINT "ItemVenta_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "ventaId",
ADD COLUMN     "ventaId" INTEGER NOT NULL,
DROP COLUMN "productoId",
ADD COLUMN     "productoId" INTEGER,
ADD CONSTRAINT "ItemVenta_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Marca" DROP CONSTRAINT "Marca_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Marca_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "MovimientoCaja" DROP CONSTRAINT "MovimientoCaja_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "cuentaId",
ADD COLUMN     "cuentaId" INTEGER NOT NULL,
DROP COLUMN "ventaId",
ADD COLUMN     "ventaId" INTEGER,
DROP COLUMN "gastoId",
ADD COLUMN     "gastoId" INTEGER,
DROP COLUMN "compraId",
ADD COLUMN     "compraId" INTEGER,
ADD CONSTRAINT "MovimientoCaja_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PagoVenta" DROP CONSTRAINT "PagoVenta_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "ventaId",
ADD COLUMN     "ventaId" INTEGER NOT NULL,
DROP COLUMN "cuentaId",
ADD COLUMN     "cuentaId" INTEGER NOT NULL,
ADD CONSTRAINT "PagoVenta_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Presupuesto" DROP CONSTRAINT "Presupuesto_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "clienteId",
ADD COLUMN     "clienteId" INTEGER,
ADD CONSTRAINT "Presupuesto_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PresupuestoItem" DROP CONSTRAINT "PresupuestoItem_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "presupuestoId",
ADD COLUMN     "presupuestoId" INTEGER NOT NULL,
DROP COLUMN "productoId",
ADD COLUMN     "productoId" INTEGER,
ADD CONSTRAINT "PresupuestoItem_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "marcaId",
ADD COLUMN     "marcaId" INTEGER,
DROP COLUMN "categoriaId",
ADD COLUMN     "categoriaId" INTEGER,
ADD CONSTRAINT "Producto_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Proveedor" DROP CONSTRAINT "Proveedor_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "clienteId",
ADD COLUMN     "clienteId" INTEGER,
ADD CONSTRAINT "Venta_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "Compra_proveedorId_idx" ON "Compra"("proveedorId");

-- CreateIndex
CREATE INDEX "Gasto_categoriaId_idx" ON "Gasto"("categoriaId");

-- CreateIndex
CREATE INDEX "HistorialPrecio_productoId_idx" ON "HistorialPrecio"("productoId");

-- CreateIndex
CREATE INDEX "ItemCompra_compraId_idx" ON "ItemCompra"("compraId");

-- CreateIndex
CREATE INDEX "ItemCompra_productoId_idx" ON "ItemCompra"("productoId");

-- CreateIndex
CREATE INDEX "ItemVenta_ventaId_idx" ON "ItemVenta"("ventaId");

-- CreateIndex
CREATE INDEX "ItemVenta_productoId_idx" ON "ItemVenta"("productoId");

-- CreateIndex
CREATE INDEX "MovimientoCaja_cuentaId_idx" ON "MovimientoCaja"("cuentaId");

-- CreateIndex
CREATE INDEX "PagoVenta_ventaId_idx" ON "PagoVenta"("ventaId");

-- CreateIndex
CREATE INDEX "PresupuestoItem_presupuestoId_idx" ON "PresupuestoItem"("presupuestoId");

-- CreateIndex
CREATE INDEX "Venta_clienteId_idx" ON "Venta"("clienteId");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialPrecio" ADD CONSTRAINT "HistorialPrecio_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenta" ADD CONSTRAINT "ItemVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVenta" ADD CONSTRAINT "ItemVenta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoVenta" ADD CONSTRAINT "PagoVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoVenta" ADD CONSTRAINT "PagoVenta_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresupuestoItem" ADD CONSTRAINT "PresupuestoItem_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCompra" ADD CONSTRAINT "ItemCompra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCompra" ADD CONSTRAINT "ItemCompra_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_gastoId_fkey" FOREIGN KEY ("gastoId") REFERENCES "Gasto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaGasto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
