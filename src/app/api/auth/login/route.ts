import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    // 1. Validar que vengan email y contraseña
    if (!body?.email || !body?.password) {
      return NextResponse.json(
        { error: "Ingresá tu email y contraseña." },
        { status: 400 }
      );
    }

    const { email, password } = body;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.activo) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos." },
        { status: 401 }
      );
    }

    
    const response = NextResponse.json({
      ok: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });

    
    response.cookies.set("session", usuario.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Ocurrió un error interno en el servidor." },
      { status: 500 }
    );
  }
}