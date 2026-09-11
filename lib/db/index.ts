import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Conexión a Postgres.
 *
 * Si `DATABASE_URL` no está configurada, `db` es null y cada llamada decide qué
 * hacer. El formulario sigue rindiendo en local con el guardado en el navegador,
 * que es lo que permite trabajar en el diseño sin base de datos levantada.
 *
 * `prepare: false` es obligatorio detrás de un pooler en modo transacción
 * (Neon y Supabase lo usan); sin eso las sentencias preparadas fallan.
 */
declare global {
  // eslint-disable-next-line no-var
  var __clientePg: ReturnType<typeof postgres> | undefined;
}

function crearCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  // En desarrollo Next recarga los módulos y abriría una conexión por recarga.
  if (!globalThis.__clientePg) {
    globalThis.__clientePg = postgres(url, { prepare: false, max: 5 });
  }
  return globalThis.__clientePg;
}

const cliente = crearCliente();

export const db = cliente ? drizzle(cliente, { schema }) : null;

export const hayBaseDeDatos = db !== null;

/** Para rutas que no pueden seguir sin base de datos. */
export function exigirDb() {
  if (!db) {
    throw new Error(
      "DATABASE_URL no está configurada. Revisa .env.local o las variables del proyecto en Vercel.",
    );
  }
  return db;
}

export { schema };
