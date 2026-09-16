--Como crear un usuario nuevo

NOMBRE_NEGOCIO="Perfumería Sur" \
ADMIN_EMAIL="admin@perfumeriasur.com" \
ADMIN_PASSWORD="ClaveSegura2026!" \
LICENCIA=PREMIUM \
npx tsx scripts/crear-empresa.ts


Si no pasás `LICENCIA`, queda en `BASICO` por defecto.

## 4) Cómo cambiarle la licencia a una empresa que ya existe

Por ahora es directo en la base (no hay pantalla para esto, a propósito):

```sql
UPDATE "Configuracion" SET licencia = 'PREMIUM' WHERE "empresaId" = <id>;
```

