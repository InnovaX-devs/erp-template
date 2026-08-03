import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { error: "Ingresá tu email y contraseña." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Email o contraseña incorrectos." },
    { status: 401 }
  );
}