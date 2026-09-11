"use client";

import { elegidosDerivados } from "@/lib/derived";
import type { PreguntaDerivadaTextoLargo } from "@/lib/types";
import { ruta } from "@/lib/validation";

import { ENTRADA, ENTRADA_ERROR, type PropsControl } from "../tipos";
import { Campo } from "./Campo";
import { Contador } from "./Contador";

/**
 * Un campo por cada tarea elegida en la pregunta derivada, rotulado con su
 * nombre real. Separarlos evita que la primera tarea se lleve todo el texto
 * y las otras dos se despachen en una línea.
 */
export function DerivadaTextoLargo({
  pregunta,
  respuestas,
  errores,
  onChange,
}: PropsControl<PreguntaDerivadaTextoLargo>) {
  const campos = elegidosDerivados(pregunta.desde, respuestas);
  const actual = (respuestas[pregunta.id] ?? {}) as Record<string, string>;

  if (campos.length === 0) {
    return (
      <Campo pregunta={pregunta}>
        <p className="border-l-[3px] border-oliva bg-oliva/10 px-4 py-3 font-sans text-sm text-oliva">
          Elige primero tus tres tareas en la pregunta anterior.
        </p>
      </Campo>
    );
  }

  function escribir(clave: string, texto: string) {
    onChange(pregunta.id, { ...actual, [clave]: texto });
  }

  return (
    <Campo pregunta={pregunta} comoGrupo>
      <div className="flex flex-col gap-5">
        {campos.map((campo, i) => {
          const idCampo = `${pregunta.id}-${campo.valor}`;
          const error = errores[ruta(pregunta.id, campo.valor)];
          const texto = actual[campo.valor] ?? "";

          return (
            <div key={campo.valor}>
              <label htmlFor={idCampo} className="mb-1.5 block">
                <span className="mr-2 font-sans text-xs font-semibold text-mostaza">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-sans text-[15px] font-medium text-negro">
                  {campo.texto}
                </span>
              </label>

              <textarea
                id={idCampo}
                rows={pregunta.filas ?? 5}
                value={texto}
                placeholder={pregunta.placeholder}
                aria-invalid={error ? true : undefined}
                onChange={(e) => escribir(campo.valor, e.target.value)}
                className={`${ENTRADA} resize-y leading-relaxed ${error ? ENTRADA_ERROR : ""}`}
              />

              {pregunta.minCaracteres && (
                <Contador actual={texto.trim().length} minimo={pregunta.minCaracteres} />
              )}

              {error && (
                <p role="alert" className="mt-1 font-sans text-sm text-alerta">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Campo>
  );
}
