"use client";

import { cantidadDerivada, opcionesDerivadas } from "@/lib/derived";
import type { PreguntaDerivadaSelect } from "@/lib/types";
import { ruta } from "@/lib/validation";

import { ENTRADA, ENTRADA_ERROR, type PropsControl } from "../tipos";
import { Campo } from "./Campo";

/**
 * Desplegables alimentados por otra pregunta (P8 se llena con lo marcado en P7).
 * Una opción ya elegida se deshabilita en los demás desplegables.
 */
export function DerivadaSelect({
  pregunta,
  respuestas,
  errores,
  onChange,
}: PropsControl<PreguntaDerivadaSelect>) {
  const opciones = opcionesDerivadas(pregunta, respuestas);
  const cantidad = cantidadDerivada(pregunta, respuestas);
  const elegidos = Array.isArray(respuestas[pregunta.id])
    ? (respuestas[pregunta.id] as string[])
    : [];

  if (opciones.length === 0) {
    return (
      <Campo pregunta={pregunta}>
        <p className="border-l-[3px] border-oliva bg-oliva/10 px-4 py-3 font-sans text-sm text-oliva">
          Marca primero al menos una tarea en la pregunta anterior.
        </p>
      </Campo>
    );
  }

  function elegir(indice: number, valor: string) {
    const siguiente = [...elegidos];
    siguiente[indice] = valor;
    onChange(pregunta.id, siguiente.slice(0, cantidad));
  }

  return (
    <Campo pregunta={pregunta} comoGrupo>
      <div className="flex flex-col gap-4">
        {Array.from({ length: cantidad }, (_, i) => {
          const idCampo = `${pregunta.id}-${i}`;
          const error = errores[ruta(pregunta.id, String(i))];
          const etiqueta = pregunta.etiquetasCampos?.[i] ?? `Opción ${i + 1}`;

          return (
            <div key={idCampo}>
              <label
                htmlFor={idCampo}
                className="mb-1.5 block font-sans text-xs uppercase tracking-[0.1em] text-oliva"
              >
                {etiqueta}
              </label>

              <div className="relative">
                <select
                  id={idCampo}
                  value={elegidos[i] ?? ""}
                  aria-invalid={error ? true : undefined}
                  onChange={(e) => elegir(i, e.target.value)}
                  className={`${ENTRADA} appearance-none pr-11 ${error ? ENTRADA_ERROR : ""}`}
                >
                  <option value="">Elige una…</option>
                  {opciones.map((o) => (
                    <option
                      key={o.valor}
                      value={o.valor}
                      disabled={
                        pregunta.sinRepetir &&
                        elegidos.includes(o.valor) &&
                        elegidos[i] !== o.valor
                      }
                    >
                      {o.texto}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-sans text-sm font-semibold text-mostaza"
                >
                  ▾
                </span>
              </div>

              {error && (
                <p role="alert" className="mt-1.5 font-sans text-sm text-alerta">
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
