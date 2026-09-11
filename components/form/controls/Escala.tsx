"use client";

import type { PreguntaEscala } from "@/lib/types";

import type { PropsControl } from "../tipos";
import { Campo } from "./Campo";

export function Escala({ pregunta, respuestas, errores, onChange }: PropsControl<PreguntaEscala>) {
  const valor = typeof respuestas[pregunta.id] === "number" ? (respuestas[pregunta.id] as number) : null;
  const error = errores[pregunta.id];

  const numeros = Array.from(
    { length: pregunta.max - pregunta.min + 1 },
    (_, i) => pregunta.min + i,
  );

  return (
    <Campo pregunta={pregunta} error={error} comoGrupo>
      <div className="flex gap-2">
        {numeros.map((n) => {
          const marcado = valor === n;
          return (
            <label
              key={n}
              htmlFor={`${pregunta.id}-${n}`}
              className={`flex h-14 flex-1 cursor-pointer items-center justify-center border-2 font-sans text-lg font-medium tabular-nums transition-colors peer-focus-visible:foco-marca ${
                marcado
                  ? "border-mostaza bg-mostaza/10 text-negro"
                  : "border-negro/15 bg-white text-oliva hover:border-negro/40"
              }`}
            >
              <input
                id={`${pregunta.id}-${n}`}
                type="radio"
                name={pregunta.id}
                value={n}
                checked={marcado}
                onChange={() => onChange(pregunta.id, n)}
                className="peer sr-only"
              />
              {n}
            </label>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between gap-4 font-sans text-xs leading-snug text-oliva">
        <span className="max-w-[45%]">
          {pregunta.min} · {pregunta.etiquetaMin}
        </span>
        <span className="max-w-[45%] text-right">
          {pregunta.max} · {pregunta.etiquetaMax}
        </span>
      </div>
    </Campo>
  );
}
