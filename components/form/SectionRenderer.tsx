"use client";

import { preguntaVisible } from "@/lib/conditions";
import type { Respuestas, Seccion, ValorRespuesta } from "@/lib/types";
import type { Errores } from "@/lib/validation";

import { QuestionRenderer } from "./QuestionRenderer";
import { Reveal } from "./Reveal";

export function SectionRenderer({
  seccion,
  indice,
  respuestas,
  errores,
  onChange,
}: {
  seccion: Seccion;
  indice: number;
  respuestas: Respuestas;
  errores: Errores;
  onChange: (id: string, valor: ValorRespuesta) => void;
}) {
  return (
    <section aria-labelledby={`titulo-${seccion.id}`}>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-mostaza">
        Sección {indice + 1}
        {seccion.opcional && " · Opcional"}
      </p>

      <h2
        id={`titulo-${seccion.id}`}
        className="titular mt-1 text-d-md leading-[0.92] text-negro"
      >
        {seccion.titulo}.
      </h2>

      {seccion.encabezado && (
        // Neutro a propósito: el acento mostaza se reserva para `ayudaDestacada`,
        // que son las dos advertencias que de verdad hay que verificar.
        <p className="mt-4 max-w-lectura border-l-[3px] border-negro/20 pl-4 font-sans text-[15px] leading-relaxed text-carbon">
          {seccion.encabezado}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-8">
        {seccion.preguntas.map((pregunta) => {
          const control = (
            <QuestionRenderer
              pregunta={pregunta}
              respuestas={respuestas}
              errores={errores}
              onChange={onChange}
            />
          );

          if (!pregunta.visibleSi) {
            return <div key={pregunta.id}>{control}</div>;
          }

          return (
            <Reveal key={pregunta.id} abierto={preguntaVisible(pregunta, respuestas)}>
              {control}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
