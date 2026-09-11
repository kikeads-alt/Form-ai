import { randomBytes } from "node:crypto";

import { eq, lt } from "drizzle-orm";

import type { Respuestas } from "../types";
import { db } from "./index";
import { drafts } from "./schema";

/** Un borrador caduca a los 30 días. El enlace de reanudar es una llave al portador. */
const DIAS_VIGENCIA = 30;

function nuevoToken(): string {
  return randomBytes(24).toString("base64url");
}

function caducidad(): Date {
  return new Date(Date.now() + DIAS_VIGENCIA * 24 * 60 * 60 * 1000);
}

export async function guardarBorrador(entrada: {
  token?: string;
  correo: string;
  seccion: number;
  datos: Respuestas;
}): Promise<string | null> {
  if (!db) return null;

  const token = entrada.token ?? nuevoToken();

  await db
    .insert(drafts)
    .values({
      token,
      correo: entrada.correo,
      seccion: entrada.seccion,
      datos: entrada.datos,
      expiraEn: caducidad(),
    })
    .onConflictDoUpdate({
      target: drafts.token,
      set: {
        correo: entrada.correo,
        seccion: entrada.seccion,
        datos: entrada.datos,
        updatedAt: new Date(),
        expiraEn: caducidad(),
      },
    });

  return token;
}

export async function leerBorrador(token: string) {
  if (!db) return null;

  const filas = await db
    .select()
    .from(drafts)
    .where(eq(drafts.token, token))
    .limit(1);

  const fila = filas[0];
  if (!fila) return null;
  if (fila.expiraEn.getTime() < Date.now()) return null;

  return fila;
}

export async function borrarBorrador(token: string): Promise<void> {
  if (!db) return;
  await db.delete(drafts).where(eq(drafts.token, token));
}

/** Limpieza oportunista de borradores caducados. */
export async function purgarBorradores(): Promise<void> {
  if (!db) return;
  await db.delete(drafts).where(lt(drafts.expiraEn, new Date()));
}
