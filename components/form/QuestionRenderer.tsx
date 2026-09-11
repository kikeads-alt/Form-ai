"use client";

import type { Pregunta, Respuestas, ValorRespuesta } from "@/lib/types";
import type { Errores } from "@/lib/validation";

import { Archivos } from "./controls/Archivos";
import { CampoTexto } from "./controls/CampoTexto";
import { CampoTextoLargo } from "./controls/CampoTextoLargo";
import { Cuadricula } from "./controls/Cuadricula";
import { DerivadaSelect } from "./controls/DerivadaSelect";
import { DerivadaTextoLargo } from "./controls/DerivadaTextoLargo";
import { Escala } from "./controls/Escala";
import { Nota } from "./controls/Nota";
import { OpcionMultiple } from "./controls/OpcionMultiple";
import { OpcionUnica } from "./controls/OpcionUnica";

/**
 * Único punto donde el motor decide qué control usar.
 * Agregar un tipo de pregunta se hace aquí y en `lib/types.ts`; agregar una
 * pregunta concreta no toca este archivo.
 */
export function QuestionRenderer(props: {
  pregunta: Pregunta;
  respuestas: Respuestas;
  errores: Errores;
  onChange: (id: string, valor: ValorRespuesta) => void;
}) {
  const { pregunta, ...resto } = props;

  switch (pregunta.tipo) {
    case "texto":
    case "email":
      return <CampoTexto pregunta={pregunta} {...resto} />;
    case "textoLargo":
      return <CampoTextoLargo pregunta={pregunta} {...resto} />;
    case "opcionUnica":
      return <OpcionUnica pregunta={pregunta} {...resto} />;
    case "opcionMultiple":
      return <OpcionMultiple pregunta={pregunta} {...resto} />;
    case "escala":
      return <Escala pregunta={pregunta} {...resto} />;
    case "derivadaSelect":
      return <DerivadaSelect pregunta={pregunta} {...resto} />;
    case "derivadaTextoLargo":
      return <DerivadaTextoLargo pregunta={pregunta} {...resto} />;
    case "cuadricula":
      return <Cuadricula pregunta={pregunta} {...resto} />;
    case "archivos":
      return <Archivos pregunta={pregunta} {...resto} />;
    case "nota":
      return <Nota pregunta={pregunta} />;
  }
}
