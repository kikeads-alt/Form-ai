"use client";

import type { PreguntaTextoLargo } from "@/lib/types";

import { ENTRADA, ENTRADA_ERROR, type PropsControl } from "../tipos";
import { Campo } from "./Campo";
import { Contador } from "./Contador";

export function CampoTextoLargo({
  pregunta,
  respuestas,
  errores,
  onChange,
}: PropsControl<PreguntaTextoLargo>) {
  const valor = typeof respuestas[pregunta.id] === "string" ? (respuestas[pregunta.id] as string) : "";
  const error = errores[pregunta.id];

  return (
    <Campo pregunta={pregunta} error={error} idControl={pregunta.id}>
      <textarea
        id={pregunta.id}
        name={pregunta.id}
        rows={pregunta.filas ?? 5}
        value={valor}
        maxLength={pregunta.maxCaracteres}
        placeholder={pregunta.placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(pregunta.id, e.target.value)}
        className={`${ENTRADA} resize-y leading-relaxed ${error ? ENTRADA_ERROR : ""}`}
      />
      {pregunta.minCaracteres && (
        <Contador actual={valor.trim().length} minimo={pregunta.minCaracteres} />
      )}
    </Campo>
  );
}
