-- Cambia el DEFAULT de colorPrimario para clientes nuevos (#4F46E5, paleta
-- genérica). No modifica filas existentes: KJ Importados ya tiene guardado
-- explícitamente su color real (#2952CC) desde la migración anterior, así
-- que no se ve afectado.
ALTER TABLE "Configuracion"
  ALTER COLUMN "colorPrimario" SET DEFAULT '#4F46E5';
