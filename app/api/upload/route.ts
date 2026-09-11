import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { buscarPregunta } from "@/lib/derived";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Firma permisos de subida directa a Vercel Blob.
 *
 * Los bytes no pasan por aquí: el navegador sube contra Blob con el token que
 * esta ruta emite. Es la única forma de admitir archivos de 10 MB, porque el
 * cuerpo de una función serverless en Vercel está topado en 4.5 MB.
 *
 * Los límites de formato y tamaño se leen del esquema de preguntas, así que
 * cambiarlos en `lib/questions.ts` los cambia también aquí.
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "La subida de archivos no está configurada todavía." },
      { status: 503 },
    );
  }

  const pregunta = buscarPregunta("archivos");
  const formatos =
    pregunta?.tipo === "archivos" ? pregunta.formatos : ["pdf", "png", "jpg"];
  const maxMB = pregunta?.tipo === "archivos" ? pregunta.maxMB : 10;

  const cuerpo = (await request.json()) as HandleUploadBody;

  try {
    const resultado = await handleUpload({
      body: cuerpo,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: formatos.map(tipoMime),
        maximumSizeInBytes: maxMB * 1024 * 1024,
        // Ruta imposible de adivinar: Vercel Blob solo ofrece almacenamiento
        // público, así que el sufijo aleatorio es la única barrera.
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // El archivo queda asociado al envío cuando el formulario se manda.
      },
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("[upload] fallo al firmar la subida:", error);
    return NextResponse.json(
      { error: "No se pudo preparar la subida." },
      { status: 400 },
    );
  }
}

const MIMES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  csv: "text/csv",
  txt: "text/plain",
};

function tipoMime(extension: string): string {
  return MIMES[extension] ?? "application/octet-stream";
}
