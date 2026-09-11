import { claveOtro, preguntasVisibles } from "./conditions";
import { cantidadDerivada, elegidosDerivados } from "./derived";
import type { Pregunta, Respuestas, Seccion } from "./types";

/**
 * Errores por ruta. La ruta es el id de la pregunta, o `id::subcampo`
 * cuando la pregunta genera varios campos (derivadas y cuadrículas).
 */
export type Errores = Record<string, string>;

export function ruta(id: string, sub?: string): string {
  return sub ? `${id}::${sub}` : id;
}

const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function contar(valor: unknown): number {
  return texto(valor).length;
}

/** Valida una pregunta y escribe en `errores`. */
function validarPregunta(pregunta: Pregunta, respuestas: Respuestas, errores: Errores): void {
  const valor = respuestas[pregunta.id];
  const obligatoria = pregunta.obligatoria === true;

  switch (pregunta.tipo) {
    case "nota":
      return;

    case "texto":
    case "email": {
      const v = texto(valor);
      if (obligatoria && !v) {
        errores[pregunta.id] = "Falta responder esta pregunta.";
      } else if (pregunta.tipo === "email" && v && !RE_CORREO.test(v)) {
        errores[pregunta.id] = "Revisa el correo: parece que falta algo.";
      }
      return;
    }

    case "textoLargo": {
      const largo = contar(valor);
      if (obligatoria && largo === 0) {
        errores[pregunta.id] = "Falta responder esta pregunta.";
      } else if (pregunta.minCaracteres && largo > 0 && largo < pregunta.minCaracteres) {
        errores[pregunta.id] =
          `Faltan ${pregunta.minCaracteres - largo} caracteres para el mínimo.`;
      } else if (obligatoria && pregunta.minCaracteres && largo < pregunta.minCaracteres) {
        errores[pregunta.id] = `Escribe al menos ${pregunta.minCaracteres} caracteres.`;
      }
      return;
    }

    case "opcionUnica": {
      const v = texto(valor);
      if (obligatoria && !v) {
        errores[pregunta.id] = "Elige una opción.";
      } else if (pregunta.permiteOtro && v === "otro" && !texto(respuestas[claveOtro(pregunta.id)])) {
        errores[pregunta.id] = "Escribe cuál.";
      }
      return;
    }

    case "opcionMultiple": {
      const lista: unknown[] = Array.isArray(valor) ? valor : [];
      const minimo = pregunta.minSelecciones ?? (obligatoria ? 1 : 0);
      if (lista.length < minimo) {
        errores[pregunta.id] =
          minimo === 1 ? "Marca al menos una opción." : `Marca al menos ${minimo} opciones.`;
      } else if (
        pregunta.permiteOtro &&
        lista.some((v) => v === "otro") &&
        !texto(respuestas[claveOtro(pregunta.id)])
      ) {
        errores[pregunta.id] = "Escribe cuál.";
      }
      return;
    }

    case "escala": {
      if (obligatoria && typeof valor !== "number") {
        errores[pregunta.id] = "Elige un número.";
      }
      return;
    }

    case "derivadaSelect": {
      if (!obligatoria) return;
      const esperados = cantidadDerivada(pregunta, respuestas);
      const elegidos = Array.isArray(valor) ? valor : [];
      for (let i = 0; i < esperados; i++) {
        if (!texto(elegidos[i])) {
          errores[ruta(pregunta.id, String(i))] = "Falta elegir.";
        }
      }
      return;
    }

    case "derivadaTextoLargo": {
      if (!obligatoria) return;
      const campos = elegidosDerivados(pregunta.desde, respuestas);
      const actual = (valor ?? {}) as Record<string, string>;
      for (const campo of campos) {
        const largo = contar(actual[campo.valor]);
        if (largo === 0) {
          errores[ruta(pregunta.id, campo.valor)] = "Falta describir esta tarea.";
        } else if (pregunta.minCaracteres && largo < pregunta.minCaracteres) {
          errores[ruta(pregunta.id, campo.valor)] =
            `Faltan ${pregunta.minCaracteres - largo} caracteres.`;
        }
      }
      return;
    }

    case "cuadricula": {
      if (!obligatoria) return;
      const filas = elegidosDerivados(pregunta.filasDesde, respuestas);
      const actual = (valor ?? {}) as Record<string, Record<string, string>>;
      for (const fila of filas) {
        for (const grupo of pregunta.grupos) {
          if (!texto(actual[fila.valor]?.[grupo.id])) {
            errores[ruta(pregunta.id, `${fila.valor}.${grupo.id}`)] = "Falta elegir.";
          }
        }
      }
      return;
    }

    case "archivos": {
      if (obligatoria && (!Array.isArray(valor) || valor.length === 0)) {
        errores[pregunta.id] = "Sube al menos un archivo.";
      }
      return;
    }
  }
}

/** Valida solo lo que hoy está visible en la sección. */
export function validarSeccion(seccion: Seccion, respuestas: Respuestas): Errores {
  const errores: Errores = {};
  for (const pregunta of preguntasVisibles(seccion, respuestas)) {
    validarPregunta(pregunta, respuestas, errores);
  }
  return errores;
}

export function hayErrores(errores: Errores): boolean {
  return Object.keys(errores).length > 0;
}

/** Id de la primera pregunta con error, para hacer scroll hasta ella. */
export function primerIdConError(errores: Errores): string | null {
  const primera = Object.keys(errores)[0];
  return primera ? primera.split("::")[0] : null;
}
