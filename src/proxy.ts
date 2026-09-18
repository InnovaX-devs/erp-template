import { auth } from "@/auth";
import { NextResponse } from "next/server";

const RUTAS_PUBLICAS = ["/login", "/api/auth"];

export default auth((req) => {
  // No alcanza con que exista sesión: una cookie vieja (de antes de que el
  // login empezara a guardar empresaId) puede seguir siendo "válida" para
  // NextAuth pero sin ese dato adentro, y el resto del sistema depende de
  // él en cada query. Sin esto, un usuario con sesión vieja pasa el
  // middleware y recién explota más adelante, en vez de que lo mandemos
  // de nuevo a loguearse.
  const isLoggedIn = !!req.auth?.user?.empresaId;
  const esRutaPublica = RUTAS_PUBLICAS.some((ruta) =>
    req.nextUrl.pathname.startsWith(ruta)
  );

  if (!isLoggedIn && !esRutaPublica) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};