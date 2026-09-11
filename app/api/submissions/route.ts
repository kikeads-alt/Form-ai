import { NextResponse } from "next/server";

import { hayBaseDeDatos } from "@/lib/db";
import { borrarBorrador } from "@/lib/db/drafts";
import { guardarEnvio } from "@/lib/db/submissions";
import { notificarEnvio } from "@/lib/email";
import { calcularBanderas } from "@/lib/flags";
import { archivosDe, identidadDe, respuestasParaEnviar } from "@/lib/payload";
import { SECCIONES, VERSION_FORMULARIO } from "@/lib/questions";
import type { Respuestas } from "@/lib/types";
import { validarSeccion } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 512 * 1024;

interface Cuerpo {
  token?: string;
  respuestas?: Respuestas;
}

/** Origen público de la app, para el enlace del correo. */
function urlBase(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  if (!hayBaseDeDatos) {
    return NextResponse.json(
      {
        error:
          "El formulario todavía no tiene base de datos conectada. Escríbeme a info@kikeads.com y lo resolvemos.",
      },
      { status: 503 },
    );
  }

  const crudo = await request.text();
  if (crudo.length > MAX_BYTES) {
    return NextResponse.json({ error: "El envío es demasiado grande." }, { status: 413 });
  }

  let cuerpo: Cuerpo;
  try {
    cuerpo = JSON.parse(crudo) as Cuerpo;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  // No se confía en la validación del navegador: se repite entera aquí,
  // con el mismo esquema y el mismo motor.
  const respuestas = cuerpo.respuestas ?? {};
  const errores = SECCIONES.reduce<Record<string, string>>(
    (acumulado, seccion) => ({ ...acumulado, ...validarSeccion(seccion, respuestas) }),
    {},
  );

  if (Object.keys(errores).length > 0) {
    return NextResponse.json(
      { error: "Faltan respuestas obligatorias.", errores },
      { status: 422 },
    );
  }

  const identidad = identidadDe(respuestas);
  const banderas = calcularBanderas(respuestas);

  try {
    const id = await guardarEnvio({
      ...identidad,
      respuestas: respuestasParaEnviar(respuestas),
      archivos: archivosDe(respuestas),
      banderas,
      versionFormulario: VERSION_FORMULARIO,
    });

    if (cuerpo.token) {
      await borrarBorrador(cuerpo.token).catch(() => undefined);
    }

    // El correo nunca hace fallar el envío.
    await notificarEnvio({
      id,
      ...identidad,
      banderas,
      urlBase: urlBase(request),
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error("[submissions] no se pudo guardar el envío:", error);
    return NextResponse.json(
      { error: "No se pudo guardar. Inténtalo otra vez en un momento." },
      { status: 500 },
    );
  }
}
