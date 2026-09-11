import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import postgres from "postgres";

import { cargarEnvLocal } from "./cargar-env";

/**
 * Aplica las migraciones de ./drizzle contra DATABASE_URL.
 *
 * Se usa el cliente directo en vez del migrador de Drizzle para que funcione
 * igual en local, en Neon y en Vercel Postgres sin depender del runtime.
 */
cargarEnvLocal();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Falta DATABASE_URL. Copia .env.example a .env.local y complétala.");
    process.exit(1);
  }

  const sql = postgres(url, { prepare: false, max: 1 });
  const carpeta = join(process.cwd(), "drizzle");

  const archivos = readdirSync(carpeta)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (archivos.length === 0) {
    console.error("No hay migraciones en ./drizzle. Ejecuta antes: npm run db:generate");
    process.exit(1);
  }

  await sql`
    create table if not exists _migraciones (
      nombre text primary key,
      aplicada_en timestamptz not null default now()
    )
  `;

  const aplicadas = new Set(
    (await sql<{ nombre: string }[]>`select nombre from _migraciones`).map((f) => f.nombre),
  );

  for (const archivo of archivos) {
    if (aplicadas.has(archivo)) {
      console.log(`· ${archivo} (ya aplicada)`);
      continue;
    }

    const contenido = readFileSync(join(carpeta, archivo), "utf8");
    // Drizzle separa sentencias con este marcador.
    const sentencias = contenido
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    await sql.begin(async (tx) => {
      for (const sentencia of sentencias) {
        await tx.unsafe(sentencia);
      }
      await tx`insert into _migraciones (nombre) values (${archivo})`;
    });

    console.log(`✓ ${archivo}`);
  }

  await sql.end();
  console.log("Migraciones al día.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
