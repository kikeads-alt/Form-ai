import { desc, eq } from "drizzle-orm";

import type {
  ArchivoSubido,
  BanderaActiva,
  EstadoEnvio,
  Respuestas,
} from "../types";
import { exigirDb } from "./index";
import { submissions } from "./schema";

export async function guardarEnvio(entrada: {
  nombre: string;
  correo: string;
  cargo: string;
  empresa: string;
  respuestas: Respuestas;
  archivos: ArchivoSubido[];
  banderas: BanderaActiva[];
  versionFormulario: string;
}): Promise<string> {
  const db = exigirDb();

  const [fila] = await db
    .insert(submissions)
    .values({ ...entrada, estado: "nueva" })
    .returning({ id: submissions.id });

  return fila.id;
}

export async function listarEnvios() {
  const db = exigirDb();
  return db.select().from(submissions).orderBy(desc(submissions.createdAt));
}

export async function leerEnvio(id: string) {
  const db = exigirDb();
  const filas = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
  return filas[0] ?? null;
}

export async function cambiarEstado(id: string, estado: EstadoEnvio): Promise<void> {
  const db = exigirDb();
  await db.update(submissions).set({ estado }).where(eq(submissions.id, id));
}
