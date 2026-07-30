import { auth } from "@/auth";
import { NextResponse } from "next/server";

const RUTAS_PUBLICAS = ["/login", "/api/auth"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
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