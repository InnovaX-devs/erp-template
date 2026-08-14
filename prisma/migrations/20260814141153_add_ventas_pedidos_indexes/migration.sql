-- CreateIndex
CREATE INDEX "Cliente_apellido_idx" ON "Cliente"("apellido");

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
