-- Nuevo campo opcional para el subtítulo del negocio en el sidebar.
-- Nulo por defecto: si el cliente no carga nada, no se muestra nada
-- (ver Sidebar.tsx). KJ Importados necesita que alguien cargue manualmente
-- "Perfumería de Lujo" en su fila desde Configuración para no perder el
-- subtítulo que tenía hardcodeado antes.
ALTER TABLE "Configuracion"
  ADD COLUMN "eslogan" TEXT;
