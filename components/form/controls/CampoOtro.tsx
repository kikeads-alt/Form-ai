"use client";

import { claveOtro } from "@/lib/conditions";
import type { Respuestas, ValorRespuesta } from "@/lib/types";

import { ENTRADA } from "../tipos";

/**
 * Texto libre del "Otro". Solo aparece cuando la opción está marcada,
 * y se enfoca solo para que el participante no tenga que buscarlo.
 */
export function CampoOtro({
  idPregunta,
  activo,
  respuestas,
  onChange,
}: {
  idPregunta: string;
  activo: boolean;
  respuestas: Respuestas;
  onChange: (id: string, valor: ValorRespuesta) => void;
}) {
  const clave = claveOtro(idPregunta);
  const valor = typeof respuestas[clave] === "string" ? (respuestas[clave] as string) : "";

  return (
    <div className={`revelar ${activo ? "revelar-abierto" : ""}`} aria-hidden={!activo}>
      <div className="revelar-interior">
        <div className="pt-2">
          <label htmlFor={clave} className="sr-only">
            Especifica cuál
          </label>
          <input
            id={clave}
            type="text"
            value={valor}
            disabled={!activo}
            maxLength={200}
            placeholder="¿Cuál?"
            onChange={(e) => onChange(clave, e.target.value)}
            className={`${ENTRADA} border-l-[3px] border-l-mostaza`}
          />
        </div>
      </div>
    </div>
  );
}
