import { claveOtro } from "./conditions";
import { SECCIONES } from "./questions";
import type {
  Opcion,
  Pregunta,
  PreguntaDerivadaSelect,
  Respuestas,
} from "./types";

/** Índice plano id → pregunta. Se calcula una vez por proceso. */
const INDICE: Map<string, Pregunta> = new Map(
  SECCIONES.flatMap((s) => s.preguntas).map((p) => [p.id, p]),
);

export function buscarPregunta(id: string): Pregunta | undefined {
  return INDICE.get(id);
}

export function todasLasPreguntas(): Pregunta[] {
  return Array.from(INDICE.values());
}

/** Texto visible de un valor guardado. Si no se reconoce, devuelve el valor crudo. */
export function textoDeOpcion(idPregunta: string, valor: string, respuestas?: Respuestas): string {
  const pregunta = buscarPregunta(idPregunta);
  if (valor === "otro") {
    const libre = respuestas?.[claveOtro(idPregunta)];
    return typeof libre === "string" && libre.trim() ? libre.trim() : "Otro";
  }
  if (pregunta && "opciones" in pregunta) {
    const opcion = pregunta.opciones.find((o) => o.valor === valor);
    if (opcion) return opcion.texto;
  }
  return valor;
}

/**
 * Opciones de una pregunta derivada (P8): lo que el participante marcó en la
 * pregunta fuente, con el texto de "Otro" ya resuelto al que él escribió.
 */
export function opcionesDerivadas(
  pregunta: PreguntaDerivadaSelect,
  respuestas: Respuestas,
): Opcion[] {
  const seleccion = respuestas[pregunta.desde];
  if (!Array.isArray(seleccion)) return [];
  return seleccion
    .filter((v): v is string => typeof v === "string")
    .map((valor) => ({ valor, texto: textoDeOpcion(pregunta.desde, valor, respuestas) }));
}

/** Cuántos desplegables se muestran: nunca más que opciones disponibles. */
export function cantidadDerivada(
  pregunta: PreguntaDerivadaSelect,
  respuestas: Respuestas,
): number {
  return Math.min(pregunta.cantidad, opcionesDerivadas(pregunta, respuestas).length);
}

/**
 * Elementos elegidos en una pregunta derivada, con su texto real.
 * Alimenta los campos de P9 y las filas de P10.
 */
export function elegidosDerivados(
  idDerivada: string,
  respuestas: Respuestas,
): { valor: string; texto: string }[] {
  const pregunta = buscarPregunta(idDerivada);
  if (!pregunta || pregunta.tipo !== "derivadaSelect") return [];

  const elegidos = respuestas[idDerivada];
  if (!Array.isArray(elegidos)) return [];

  return elegidos
    .filter((v): v is string => typeof v === "string" && v !== "")
    .map((valor) => ({ valor, texto: textoDeOpcion(pregunta.desde, valor, respuestas) }));
}

/**
 * Poda respuestas que quedaron huérfanas.
 *
 * Si alguien desmarca en P7 una tarea que ya había elegido en P8, hay que
 * quitarla de P8 y borrar su texto en P9 y su fila en P10. Sin esto el envío
 * llegaría con descripciones de tareas que el participante ya descartó.
 */
export function sanearRespuestas(respuestas: Respuestas): Respuestas {
  const saneadas: Respuestas = { ...respuestas };

  for (const pregunta of todasLasPreguntas()) {
    if (pregunta.tipo !== "derivadaSelect") continue;

    const disponibles = new Set(opcionesDerivadas(pregunta, saneadas).map((o) => o.valor));
    const elegidos = Array.isArray(saneadas[pregunta.id])
      ? (saneadas[pregunta.id] as string[])
      : [];
    const vigentes = elegidos.filter((v) => v === "" || disponibles.has(v));

    if (vigentes.length !== elegidos.length) {
      saneadas[pregunta.id] = vigentes;
    }

    const vigentesSet = new Set(vigentes.filter(Boolean));

    // Campos de texto y filas de cuadrícula que dependen de esta derivada.
    for (const dependiente of todasLasPreguntas()) {
      const fuente =
        dependiente.tipo === "derivadaTextoLargo"
          ? dependiente.desde
          : dependiente.tipo === "cuadricula"
            ? dependiente.filasDesde
            : null;

      if (fuente !== pregunta.id) continue;

      const actual = saneadas[dependiente.id];
      if (!actual || typeof actual !== "object" || Array.isArray(actual)) continue;

      const podado = Object.fromEntries(
        Object.entries(actual as Record<string, unknown>).filter(([clave]) =>
          vigentesSet.has(clave),
        ),
      );
      saneadas[dependiente.id] = podado as Respuestas[string];
    }
  }

  return saneadas;
}
