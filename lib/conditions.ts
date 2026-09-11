import type { Condicion, Pregunta, Respuestas, Seccion } from "./types";

/**
 * Clave donde se guarda el texto libre de un "Otro".
 * Se guarda plano, junto a la respuesta: { sistemas: ["erp","otro"], sistemas__otro: "Siigo" }
 */
export function claveOtro(idPregunta: string): string {
  return `${idPregunta}__otro`;
}

/** Normaliza cualquier respuesta a arreglo de strings para comparar. */
function comoLista(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.filter((v): v is string => typeof v === "string");
  if (typeof valor === "string") return valor === "" ? [] : [valor];
  if (typeof valor === "number") return [String(valor)];
  return [];
}

export function evaluarCondicion(condicion: Condicion, respuestas: Respuestas): boolean {
  if ("todas" in condicion) {
    return condicion.todas.every((c) => evaluarCondicion(c, respuestas));
  }
  if ("alguna" in condicion) {
    return condicion.alguna.some((c) => evaluarCondicion(c, respuestas));
  }
  if ("no" in condicion) {
    return !evaluarCondicion(condicion.no, respuestas);
  }

  const valores = comoLista(respuestas[condicion.pregunta]);

  if ("es" in condicion) {
    return valores.some((v) => condicion.es.includes(v));
  }
  if ("incluye" in condicion) {
    return valores.some((v) => condicion.incluye.includes(v));
  }
  if ("incluyeAlgoDistintoDe" in condicion) {
    return valores.some((v) => !condicion.incluyeAlgoDistintoDe.includes(v));
  }
  if ("respondida" in condicion) {
    return valores.length > 0;
  }
  return false;
}

export function preguntaVisible(pregunta: Pregunta, respuestas: Respuestas): boolean {
  if (!pregunta.visibleSi) return true;
  return evaluarCondicion(pregunta.visibleSi, respuestas);
}

/** Preguntas de una sección que hoy están visibles según lo respondido. */
export function preguntasVisibles(seccion: Seccion, respuestas: Respuestas): Pregunta[] {
  return seccion.preguntas.filter((p) => preguntaVisible(p, respuestas));
}
