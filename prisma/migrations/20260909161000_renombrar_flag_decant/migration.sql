-- Renombra el flag para que coincida con el nombre pedido en el issue.
-- RENAME COLUMN conserva el valor que ya tenía cada fila (no se pierde nada).
ALTER TABLE "Configuracion"
  RENAME COLUMN "ventaPorDecant" TO "moduloDecantHabilitado";
