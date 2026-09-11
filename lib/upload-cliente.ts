import { upload } from "@vercel/blob/client";

import type { ArchivoSubido } from "./types";

/**
 * Sube un archivo directo desde el navegador a Vercel Blob.
 *
 * No pasa por nuestra API a propósito: el cuerpo de una función serverless en
 * Vercel está limitado a 4.5 MB y el formulario admite archivos de 10 MB. La
 * ruta `/api/upload` solo firma el permiso de subida; los bytes no la tocan.
 */
export async function subirArchivo(
  archivo: File,
  alProgresar: (porcentaje: number) => void,
): Promise<ArchivoSubido> {
  const resultado = await upload(archivo.name, archivo, {
    access: "public",
    handleUploadUrl: "/api/upload",
    onUploadProgress: ({ percentage }) => alProgresar(Math.round(percentage)),
  });

  return {
    nombre: archivo.name,
    url: resultado.url,
    tipo: archivo.type || "application/octet-stream",
    tamano: archivo.size,
  };
}
