import { NextResponse } from "next/server";

import { guardarBorrador, purgarBorradores } from "@/lib/db/drafts";
import { hayBaseDeDatos } from "@/lib/db";
import type { Respuestas } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_BYTES = 256 * 1024;

interface Cuerpo {
  token?: string;
  correo?: string;
  seccion?: number;
  datos?: Respuestas;
}

/**
 * Guarda el avance en servidor para poder retomarlo desde otro dispositivo.
 *
 * Si no hay base de datos configurada responde 204: el formulario sigue
 * funcionando con el guardado local y el participante no se entera.
 */
export async function POST(request: Request) {
  if (!hayBaseDeDatos) {
    return new NextResponse(null, { status: 204 });
  }

  const crudo = await request.text();
  if (crudo.length > MAX_BYTES) {
    return NextResponse.json({ error: "Avance demasiado grande." }, { status: 413 });
  }

  let cuerpo: Cuerpo;
  try {
    cuerpo = JSON.parse(crudo) as Cuerpo;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const correo = (cuerpo.correo ?? "").trim().toLowerCase();
  if (!RE_CORREO.test(correo)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  try {
    const token = await guardarBorrador({
      token: typeof cuerpo.token === "string" && cuerpo.token.length <= 64 ? cuerpo.token : undefined,
      correo,
      seccion: Number.isInteger(cuerpo.seccion) ? (cuerpo.seccion as number) : 0,
      datos: cuerpo.datos ?? {},
    });

    // Aprovechamos el paso para limpiar lo caducado, sin bloquear la respuesta.
    void purgarBorradores().catch(() => undefined);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[drafts] no se pudo guardar el borrador:", error);
    return new NextResponse(null, { status: 204 });
  }
}
