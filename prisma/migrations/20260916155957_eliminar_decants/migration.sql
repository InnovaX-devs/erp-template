/*
  Warnings:

  - The values [OVERRIDE_5ML,OVERRIDE_10ML] on the enum `CampoPrecio` will be removed. If these variants are still used in the database, this will fail.
  - The values [RECALCULO_DECANT] on the enum `OrigenCambioPrecio` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `costoEnvaseDecantARS` on the `Configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `divisorFrascoDecant` on the `Configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `moduloDecantHabilitado` on the `Configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `multiplicadorInsumoDecant` on the `Configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `offsetDecant5mlARS` on the `Configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `abrioFrascoCerrado` on the `ItemVenta` table. All the data in the column will be lost.
  - You are about to drop the column `presentacion` on the `ItemVenta` table. All the data in the column will be lost.
  - You are about to drop the column `presentacion` on the `PresupuestoItem` table. All the data in the column will be lost.
  - You are about to drop the column `overrideDecant10ml` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `overrideDecant5ml` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `seVendePorDecant` on the `Producto` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CampoPrecio_new" AS ENUM ('COSTO', 'MINORISTA', 'MAYORISTA');
ALTER TABLE "HistorialPrecio" ALTER COLUMN "campo" TYPE "CampoPrecio_new" USING ("campo"::text::"CampoPrecio_new");
ALTER TYPE "CampoPrecio" RENAME TO "CampoPrecio_old";
ALTER TYPE "CampoPrecio_new" RENAME TO "CampoPrecio";
DROP TYPE "public"."CampoPrecio_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrigenCambioPrecio_new" AS ENUM ('MANUAL', 'ACTUALIZACION_MASIVA', 'COMPRA_CONFIRMADA');
ALTER TABLE "HistorialPrecio" ALTER COLUMN "origen" TYPE "OrigenCambioPrecio_new" USING ("origen"::text::"OrigenCambioPrecio_new");
ALTER TYPE "OrigenCambioPrecio" RENAME TO "OrigenCambioPrecio_old";
ALTER TYPE "OrigenCambioPrecio_new" RENAME TO "OrigenCambioPrecio";
DROP TYPE "public"."OrigenCambioPrecio_old";
COMMIT;

-- AlterTable
ALTER TABLE "Configuracion" DROP COLUMN "costoEnvaseDecantARS",
DROP COLUMN "divisorFrascoDecant",
DROP COLUMN "moduloDecantHabilitado",
DROP COLUMN "multiplicadorInsumoDecant",
DROP COLUMN "offsetDecant5mlARS";

-- AlterTable
ALTER TABLE "ItemVenta" DROP COLUMN "abrioFrascoCerrado",
DROP COLUMN "presentacion";

-- AlterTable
ALTER TABLE "PresupuestoItem" DROP COLUMN "presentacion";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "overrideDecant10ml",
DROP COLUMN "overrideDecant5ml",
DROP COLUMN "seVendePorDecant";

-- DropEnum
DROP TYPE "Presentacion";
