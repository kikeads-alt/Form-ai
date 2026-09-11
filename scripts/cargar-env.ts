import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Carga .env.local para los scripts que corren fuera de Next.
 *
 * Next lee .env.local solo; drizzle-kit y el migrador no. En Vercel las
 * variables ya vienen del entorno, así que si el archivo no existe no pasa nada.
 */
export function cargarEnvLocal(): void {
  for (const archivo of [".env.local", ".env"]) {
    const ruta = join(process.cwd(), archivo);
    if (!existsSync(ruta)) continue;

    for (const linea of readFileSync(ruta, "utf8").split("\n")) {
      const limpia = linea.trim();
      if (!limpia || limpia.startsWith("#")) continue;

      const separador = limpia.indexOf("=");
      if (separador === -1) continue;

      const clave = limpia.slice(0, separador).trim();
      if (process.env[clave]) continue; // el entorno real manda

      let valor = limpia.slice(separador + 1).trim();
      if (
        (valor.startsWith('"') && valor.endsWith('"')) ||
        (valor.startsWith("'") && valor.endsWith("'"))
      ) {
        valor = valor.slice(1, -1);
      }
      process.env[clave] = valor;
    }
  }
}
