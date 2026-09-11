import type { ReactNode } from "react";

import { Callout } from "@/components/ui/Callout";
import type { Pregunta } from "@/lib/types";

import { numeroVisible } from "../tipos";

/**
 * Envoltorio de una pregunta: número, etiqueta, ayudas y error.
 *
 * Cuando el control son varios inputs (radios, casillas, cuadrícula) usa
 * `comoGrupo` para que el título sea un <legend> dentro de un <fieldset>,
 * que es lo que los lectores de pantalla necesitan para anunciar el grupo.
 */
export function Campo({
  pregunta,
  error,
  comoGrupo = false,
  idControl,
  children,
}: {
  pregunta: Pregunta;
  error?: string;
  comoGrupo?: boolean;
  idControl?: string;
  children: ReactNode;
}) {
  const Contenedor = comoGrupo ? "fieldset" : "div";
  const Titulo = comoGrupo ? "legend" : "label";

  const encabezado = (
    <>
      {pregunta.numero !== undefined && (
        <span className="mr-2 font-sans text-xs font-semibold tracking-[0.1em] text-oliva">
          {numeroVisible(pregunta.numero)}
        </span>
      )}
      <span className="font-sans text-[17px] font-medium leading-snug text-negro">
        {pregunta.etiqueta}
      </span>
      {pregunta.obligatoria && (
        <>
          {/* En oliva, no en mostaza: el asterisco mostaza sobre crema da 2:1. */}
          <span className="ml-1 font-semibold text-oliva" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> (obligatorio)</span>
        </>
      )}
    </>
  );

  return (
    <Contenedor
      id={`campo-${pregunta.id}`}
      className="scroll-mt-32 border-0 p-0"
      aria-describedby={error ? `error-${pregunta.id}` : undefined}
    >
      <Titulo
        className="block w-full"
        {...(!comoGrupo && idControl ? { htmlFor: idControl } : {})}
      >
        {encabezado}
      </Titulo>

      {pregunta.ayuda && (
        <p className="mt-1.5 font-sans text-sm leading-relaxed text-oliva">{pregunta.ayuda}</p>
      )}

      {pregunta.ayudaDestacada && <Callout>{pregunta.ayudaDestacada}</Callout>}

      <div className="mt-3">{children}</div>

      {error && (
        <p
          id={`error-${pregunta.id}`}
          role="alert"
          className="mt-2 border-l-[3px] border-alerta bg-alerta/10 px-3 py-2 font-sans text-sm text-alerta"
        >
          {error}
        </p>
      )}
    </Contenedor>
  );
}
