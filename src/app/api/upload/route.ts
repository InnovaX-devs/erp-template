import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fotoUrlAnterior = formData.get("fotoUrlAnterior") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo (JPG / PNG)
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "El formato del archivo debe ser JPG, PNG o WEBP" },
        { status: 400 }
      );
    }

    // 1. Eliminar la foto anterior de Vercel Blob si existe para no dejar huérfanos
    if (fotoUrlAnterior && fotoUrlAnterior.includes("public.blob.vercel-storage.com")) {
      try {
        await del(fotoUrlAnterior);
      } catch (err) {
        console.warn("No se pudo eliminar la imagen anterior de Vercel Blob:", err);
      }
    }

    // 2. Subir el nuevo archivo a Vercel Blob
    const filename = `productos/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}