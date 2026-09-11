"use client";

import type { PreguntaTexto } from "@/lib/types";

import { ENTRADA, ENTRADA_ERROR, type PropsControl } from "../tipos";
import { Campo } from "./Campo";

export function CampoTexto({
  pregunta,
  respuestas,
  errores,
  onChange,
}: PropsControl<PreguntaTexto>) {
  const valor = typeof respuestas[pregunta.id] === "string" ? (respuestas[pregunta.id] as string) : "";
  const error = errores[pregunta.id];

  return (
    <Campo pregunta={pregunta} error={error} idControl={pregunta.id}>
      <input
        id={pregunta.id}
        name={pregunta.id}
        type={pregunta.tipo === "email" ? "email" : "text"}
        inputMode={pregunta.tipo === "email" ? "email" : "text"}
        autoComplete={
          pregunta.tipo === "email"
            ? "email"
            : pregunta.id === "nombre"
              ? "name"
              : pregunta.id === "empresa"
                ? "organization"
                : pregunta.id === "cargo"
                  ? "organization-title"
                  : "off"
        }
        value={valor}
        maxLength={pregunta.maxCaracteres}
        placeholder={pregunta.placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(pregunta.id, e.target.value)}
        className={`${ENTRADA} ${error ? ENTRADA_ERROR : ""}`}
      />
    </Campo>
  );
}
