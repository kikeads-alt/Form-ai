"use client";

import type { PreguntaOpcionUnica } from "@/lib/types";

import type { PropsControl } from "../tipos";
import { Campo } from "./Campo";
import { CampoOtro } from "./CampoOtro";
import { OpcionCaja } from "./OpcionCaja";

export function OpcionUnica({
  pregunta,
  respuestas,
  errores,
  onChange,
}: PropsControl<PreguntaOpcionUnica>) {
  const valor = typeof respuestas[pregunta.id] === "string" ? (respuestas[pregunta.id] as string) : "";
  const error = errores[pregunta.id];

  const opciones = pregunta.permiteOtro
    ? [...pregunta.opciones, { valor: "otro", texto: "Otro" }]
    : pregunta.opciones;

  return (
    <Campo pregunta={pregunta} error={error} comoGrupo>
      <div className="flex flex-col gap-2">
        {opciones.map((opcion) => (
          <OpcionCaja
            key={opcion.valor}
            tipo="radio"
            name={pregunta.id}
            id={`${pregunta.id}-${opcion.valor}`}
            valor={opcion.valor}
            texto={opcion.texto}
            marcada={valor === opcion.valor}
            onSelect={(v) => onChange(pregunta.id, v)}
          />
        ))}
      </div>

      {pregunta.permiteOtro && (
        <CampoOtro
          idPregunta={pregunta.id}
          activo={valor === "otro"}
          respuestas={respuestas}
          onChange={onChange}
        />
      )}
    </Campo>
  );
}
