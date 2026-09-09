-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MonedaPrecio" AS ENUM ('ARS', 'USD');

-- CreateEnum
CREATE TYPE "CampoPrecio" AS ENUM ('COSTO', 'MINORISTA', 'MAYORISTA', 'OVERRIDE_5ML', 'OVERRIDE_10ML');

-- CreateEnum
CREATE TYPE "OrigenCambioPrecio" AS ENUM ('MANUAL', 'RECALCULO_DECANT', 'ACTUALIZACION_MASIVA', 'COMPRA_CONFIRMADA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PAGADA', 'A_CUENTA', 'ANULADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "Presentacion" AS ENUM ('FRASCO', 'DECANT_5ML', 'DECANT_10ML');

-- CreateEnum
CREATE TYPE "TipoPrecioVenta" AS ENUM ('MINORISTA', 'MAYORISTA');

-- CreateEnum
CREATE TYPE "EstadoPresupuesto" AS ENUM ('BORRADOR', 'VENCIDO', 'CONVERTIDO');

-- CreateEnum
CREATE TYPE "TipoCuenta" AS ENUM ('EFECTIVO_ARS', 'EFECTIVO_USD', 'BANCO_ARS', 'BANCO_USD');

-- CreateEnum
CREATE TYPE "TipoMovimientoCaja" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "ConceptoMovimientoCaja" AS ENUM ('VENTA_COBRADA', 'PAGO_DEUDA_CLIENTE', 'PAGO_A_PROVEEDOR', 'GASTO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoPagoGasto" AS ENUM ('PENDIENTE', 'PAGADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marca" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Marca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigoBarras" TEXT,
    "ubicacionDeposito" TEXT,
    "fotoUrl" TEXT,
    "contenidoMl" INTEGER,
    "marcaId" INTEGER,
    "categoriaId" INTEGER,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "monedaPrecio" "MonedaPrecio" NOT NULL DEFAULT 'USD',
    "precioCosto" DOUBLE PRECISION NOT NULL,
    "precioVenta" DOUBLE PRECISION NOT NULL,
    "margenMinorista" DOUBLE PRECISION,
    "precioMayorista" DOUBLE PRECISION,
    "margenMayorista" DOUBLE PRECISION,
    "precioOferta" DOUBLE PRECISION,
    "seVendePorDecant" BOOLEAN NOT NULL DEFAULT false,
    "overrideDecant5ml" DOUBLE PRECISION,
    "overrideDecant10ml" DOUBLE PRECISION,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialPrecio" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "campo" "CampoPrecio" NOT NULL,
    "valorAnterior" DOUBLE PRECISION,
    "valorNuevo" DOUBLE PRECISION NOT NULL,
    "origen" "OrigenCambioPrecio" NOT NULL,
    "detalle" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialPrecio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "localidad" TEXT,
    "esMayorista" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER,
    "presupuestoId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cotizacionUsada" DOUBLE PRECISION NOT NULL,
    "descuentoMonto" DOUBLE PRECISION,
    "descuentoPorcentaje" DOUBLE PRECISION,
    "totalUSD" DOUBLE PRECISION NOT NULL,
    "totalARS" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'PAGADA',
    "armado" BOOLEAN NOT NULL DEFAULT false,
    "enviado" BOOLEAN NOT NULL DEFAULT false,
    "retirado" BOOLEAN NOT NULL DEFAULT false,
    "impreso" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemVenta" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "descripcionLibre" TEXT,
    "presentacion" "Presentacion" NOT NULL DEFAULT 'FRASCO',
    "abrioFrascoCerrado" BOOLEAN NOT NULL DEFAULT false,
    "tipoPrecio" "TipoPrecioVenta" NOT NULL DEFAULT 'MINORISTA',
    "cantidad" INTEGER NOT NULL,
    "precioUnitarioUSD" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemVenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoVenta" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "cuentaId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PagoVenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presupuesto" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenciaDias" INTEGER NOT NULL DEFAULT 15,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,
    "descuentoMonto" DOUBLE PRECISION,
    "descuentoPorcentaje" DOUBLE PRECISION,
    "total" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoPresupuesto" NOT NULL DEFAULT 'BORRADOR',

    CONSTRAINT "Presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresupuestoItem" (
    "id" SERIAL NOT NULL,
    "presupuestoId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "descripcion" TEXT NOT NULL,
    "presentacion" "Presentacion" NOT NULL DEFAULT 'FRASCO',
    "tipoPrecio" "TipoPrecioVenta" NOT NULL DEFAULT 'MINORISTA',
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PresupuestoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "personaContacto" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "deudaInicial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" SERIAL NOT NULL,
    "proveedorId" INTEGER,
    "cuentaId" INTEGER NOT NULL,
    "totalUSD" DOUBLE PRECISION NOT NULL,
    "totalARS" DOUBLE PRECISION,
    "cotizacionUsada" DOUBLE PRECISION,
    "confirmada" BOOLEAN NOT NULL DEFAULT false,
    "pagada" BOOLEAN NOT NULL DEFAULT false,
    "recibida" BOOLEAN NOT NULL DEFAULT false,
    "cancelada" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCompra" (
    "id" SERIAL NOT NULL,
    "compraId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "costoUnitarioUSD" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuenta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoCuenta" NOT NULL,
    "titular" TEXT,
    "banco" TEXT,
    "alias" TEXT,
    "cbu" TEXT,
    "color" TEXT,
    "favorita" BOOLEAN NOT NULL DEFAULT false,
    "saldoInicial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldoActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "limiteMensualIngresos" DOUBLE PRECISION,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cuenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoCaja" (
    "id" SERIAL NOT NULL,
    "cuentaId" INTEGER NOT NULL,
    "tipo" "TipoMovimientoCaja" NOT NULL,
    "concepto" "ConceptoMovimientoCaja" NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "saldoResultante" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ventaId" INTEGER,
    "gastoId" INTEGER,
    "compraId" INTEGER,

    CONSTRAINT "MovimientoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaGasto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "CategoriaGasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" SERIAL NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "concepto" TEXT NOT NULL,
    "categoriaId" INTEGER,
    "proveedorId" INTEGER,
    "observaciones" TEXT,
    "estadoPago" "EstadoPagoGasto" NOT NULL DEFAULT 'PENDIENTE',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nombreNegocio" TEXT NOT NULL,
    "logoUrl" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "remitenteNombre" TEXT,
    "remitenteDni" TEXT,
    "cotizacionUSD" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "costoPromedioPonderado" BOOLEAN NOT NULL DEFAULT true,
    "margenGananciaGlobal" BOOLEAN NOT NULL DEFAULT false,
    "margenMinoristaDefault" DOUBLE PRECISION,
    "margenMayoristaDefault" DOUBLE PRECISION,
    "costoEnvaseDecantARS" DOUBLE PRECISION,
    "multiplicadorInsumoDecant" DOUBLE PRECISION,
    "divisorFrascoDecant" DOUBLE PRECISION DEFAULT 9,
    "offsetDecant5mlARS" DOUBLE PRECISION DEFAULT 200,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Marca_nombre_key" ON "Marca"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigoBarras_key" ON "Producto"("codigoBarras");

-- CreateIndex
CREATE INDEX "Producto_nombre_idx" ON "Producto"("nombre");

-- CreateIndex
CREATE INDEX "Producto_codigoBarras_idx" ON "Producto"("codigoBarras");

-- CreateIndex
CREATE INDEX "HistorialPrecio_productoId_idx" ON "HistorialPrecio"("productoId");

-- CreateIndex
CREATE INDEX "HistorialPrecio_fecha_idx" ON "HistorialPrecio"("fecha");

-- CreateIndex
CREATE INDEX "Cliente_nombre_idx" ON "Cliente"("nombre");

-- CreateIndex
CREATE INDEX "Cliente_apellido_idx" ON "Cliente"("apellido");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_presupuestoId_key" ON "Venta"("presupuestoId");

-- CreateIndex
CREATE INDEX "Venta_clienteId_idx" ON "Venta"("clienteId");

-- CreateIndex
CREATE INDEX "Venta_fecha_idx" ON "Venta"("fecha");

-- CreateIndex
CREATE INDEX "Venta_estadoPago_idx" ON "Venta"("estadoPago");

-- CreateIndex
CREATE INDEX "Venta_estadoPago_fecha_idx" ON "Venta"("estadoPago", "fecha");

-- CreateIndex
CREATE INDEX "Venta_retirado_estadoPago_idx" ON "Venta"("retirado", "estadoPago");

-- CreateIndex
CREATE INDEX "Venta_armado_idx" ON "Venta"("armado");

-- CreateIndex
CREATE INDEX "Venta_enviado_idx" ON "Venta"("enviado");

-- CreateIndex
CREATE INDEX "ItemVenta_ventaId_idx" ON "ItemVenta"("ventaId");

-- CreateIndex
CREATE INDEX "ItemVenta_productoId_idx" ON "ItemVenta"("productoId");

-- CreateIndex
CREATE INDEX "PagoVenta_ventaId_idx" ON "PagoVenta"("ventaId");

-- CreateIndex
CREATE INDEX "PresupuestoItem_presupuestoId_idx" ON "PresupuestoItem"("presupuestoId");

-- CreateIndex
CREATE INDEX "Proveedor_nombre_idx" ON "Proveedor"("nombre");

-- CreateIndex
CREATE INDEX "Compra_proveedorId_idx" ON "Compra"("proveedorId");

-- CreateIndex
CREATE INDEX "Compra_cuentaId_idx" ON "Compra"("cuentaId");

-- CreateIndex
CREATE INDEX "Compra_fecha_idx" ON "Compra"("fecha");

-- CreateIndex
CREATE INDEX "ItemCompra_compraId_idx" ON "ItemCompra"("compraId");

-- CreateIndex
CREATE INDEX "ItemCompra_productoId_idx" ON "ItemCompra"("productoId");

-- CreateIndex
CREATE INDEX "Cuenta_nombre_idx" ON "Cuenta"("nombre");

-- CreateIndex
CREATE INDEX "MovimientoCaja_cuentaId_idx" ON "MovimientoCaja"("cuentaId");

-- CreateIndex
CREATE INDEX "MovimientoCaja_fecha_idx" ON "MovimientoCaja"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaGasto_nombre_key" ON "CategoriaGasto"("nombre");

-- CreateIndex
CREATE INDEX "Gasto_fecha_idx" ON "Gasto"("fecha");

-- CreateIndex
CREATE INDEX "Gasto_categoriaId_idx" ON "Gasto"("categoriaId");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialPrecio" ADD CONSTRAINT "HistorialPrecio_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

