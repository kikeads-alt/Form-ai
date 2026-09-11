import { claveOtro, preguntaVisible } from "./conditions";
import { SECCIONES } from "./questions";
import type { ArchivoSubido, Respuestas } from "./types";

/**
 * Deja fuera lo que el participante respondió y luego dejó de ver.
 *
 * Ejemplo: marca "Windows de la empresa", contesta si tiene permisos, cambia a
 * "Mac personal". La respuesta de permisos sigue en memoria por si vuelve
 * atrás, pero no debe llegar al envío ni disparar una bandera.
 */
export function respuestasParaEnviar(respuestas: Respuestas): Respuestas {
  const salida: Respuestas = {};

  for (const seccion of SECCIONES) {
    for (const pregunta of seccion.preguntas) {
      if (pregunta.tipo === "nota") continue;
      if (!preguntaVisible(pregunta, respuestas)) continue;

      const valor = respuestas[pregunta.id];
      if (valor !== undefined && valor !== null && valor !== "") {
        salida[pregunta.id] = valor;
      }

      const libre = respuestas[claveOtro(pregunta.id)];
      if (typeof libre === "string" && libre.trim()) {
        salida[claveOtro(pregunta.id)] = libre.trim();
      }
    }
  }

  return salida;
}

/** Id de la pregunta de tipo archivos. Se guarda en su propia columna. */
const ID_ARCHIVOS = "archivos";

export function archivosDe(respuestas: Respuestas): ArchivoSubido[] {
  const valor = respuestas[ID_ARCHIVOS];
  if (!Array.isArray(valor)) return [];
  return valor.filter(
    (a): a is ArchivoSubido =>
      typeof a === "object" && a !== null && "url" in a && "nombre" in a,
  );
}

function comoTexto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/** Los cuatro campos que se guardan en columnas propias, para poder listarlos. */
export function identidadDe(respuestas: Respuestas) {
  return {
    nombre: comoTexto(respuestas.nombre),
    correo: comoTexto(respuestas.correo).toLowerCase(),
    cargo: comoTexto(respuestas.cargo),
    empresa: comoTexto(respuestas.empresa),
  };
}
