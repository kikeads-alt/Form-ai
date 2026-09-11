"use client";

import type { PreguntaOpcionMultiple } from "@/lib/types";

import type { PropsControl } from "../tipos";
import { Campo } from "./Campo";
import { CampoOtro } from "./CampoOtro";
import { OpcionCaja } from "./OpcionCaja";

export function OpcionMultiple({
  pregunta,
  respuestas,
  errores,
  onChange,
}: PropsControl<PreguntaOpcionMultiple>) {
  const actual = Array.isArray(respuestas[pregunta.id])
    ? (respuestas[pregunta.id] as string[])
    : [];
  const error = errores[pregunta.id];

  const opciones = pregunta.permiteOtro
    ? [...pregunta.opciones, { valor: "otro", texto: "Otro" }]
    : pregunta.opciones;

  const excluyentes = new Set(
    pregunta.opciones.filter((o) => o.excluyente).map((o) => o.valor),
  );

  function alternar(valor: string) {
    let siguiente: string[];

    if (actual.includes(valor)) {
      siguiente = actual.filter((v) => v !== valor);
    } else if (excluyentes.has(valor)) {
      // "Ninguna", "No existe": al marcarla se apaga todo lo demás.
      siguiente = [valor];
    } else {
      siguiente = [...actual.filter((v) => !excluyentes.has(v)), valor];
    }

    onChange(pregunta.id, siguiente);
  }

  return (
    <Campo pregunta={pregunta} error={error} comoGrupo>
      <div className="flex flex-col gap-2">
        {opciones.map((opcion) => (
          <OpcionCaja
            key={opcion.valor}
            tipo="checkbox"
            name={pregunta.id}
            id={`${pregunta.id}-${opcion.valor}`}
            valor={opcion.valor}
            texto={opcion.texto}
            marcada={actual.includes(opcion.valor)}
            onSelect={alternar}
          />
        ))}
      </div>

      {pregunta.permiteOtro && (
        <CampoOtro
          idPregunta={pregunta.id}
          activo={actual.includes("otro")}
          respuestas={respuestas}
          onChange={onChange}
        />
      )}
    </Campo>
  );
}
