import { auth } from "@/auth";

/**
 * Punto ÚNICO de resolución de "a qué empresa pertenece este request".
 *
 * Todo server action y toda ruta API que toque datos de negocio (productos,
 * ventas, clientes, cuentas, etc.) DEBE llamar a esta función y usar el
 * empresaId devuelto en el `where` de cada query — tanto para leer como
 * para escribir. Nunca confiar en un empresaId que venga del cliente
 * (body, query params): siempre se resuelve server-side desde la sesión.
 *
 * Si no hay sesión válida, lanza. Las rutas protegidas ya deberían haber
 * cortado el acceso antes (middleware/auth), así que llegar acá sin sesión
 * es un bug, no un caso esperado — por eso explota en vez de devolver un
 * valor por defecto silencioso.
 */
export async function obtenerEmpresaIdActual(): Promise<number> {
  const session = await auth();

  if (!session?.user?.empresaId) {
    throw new Error("No se pudo resolver la empresa del usuario autenticado.");
  }

  return session.user.empresaId;
}
