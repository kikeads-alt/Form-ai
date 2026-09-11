"use client";

import { elegidosDerivados } from "@/lib/derived";
import type { PreguntaCuadricula } from "@/lib/types";
import { ruta } from "@/lib/validation";

import type { PropsControl } from "../tipos";
import { Campo } from "./Campo";

/**
 * Frecuencia y tiempo por tarea.
 *
 * No hay cuadrícula en ningún ancho: son tarjetas apiladas, una por tarea, y a
 * partir de `md` los dos grupos se colocan lado a lado dentro de la misma
 * tarjeta. Una tabla real obligaría a desplazamiento horizontal en móvil, que
 * es justo donde se va a llenar esto.
 */
export function Cuadricula({
  pregunta,
  respuestas,
  errores,
  onChange,
}: PropsControl<PreguntaCuadricula>) {
  const filas = elegidosDerivados(pregunta.filasDesde, respuestas);
  const actual = (respuestas[pregunta.id] ?? {}) as Record<string, Record<string, string>>;

  if (filas.length === 0) {
    return (
      <Campo pregunta={pregunta}>
        <p className="border-l-[3px] border-oliva bg-oliva/10 px-4 py-3 font-sans text-sm text-oliva">
          Elige primero tus tres tareas.
        </p>
      </Campo>
    );
  }

  function marcar(fila: string, grupo: string, valor: string) {
    onChange(pregunta.id, {
      ...actual,
      [fila]: { ...(actual[fila] ?? {}), [grupo]: valor },
    });
  }

  return (
    <Campo pregunta={pregunta} comoGrupo>
      <div className="flex flex-col gap-3">
        {filas.map((fila, i) => (
          <div key={fila.valor} className="border-2 border-negro/15 bg-white p-4">
            <p className="mb-3 font-sans text-[15px] font-medium leading-snug text-negro">
              <span className="mr-2 text-xs font-semibold text-mostaza">
                {String(i + 1).padStart(2, "0")}
              </span>
              {fila.texto}
            </p>

            <div className="flex flex-col gap-4 md:flex-row md:gap-6">
              {pregunta.grupos.map((grupo) => {
                const error = errores[ruta(pregunta.id, `${fila.valor}.${grupo.id}`)];
                const elegido = actual[fila.valor]?.[grupo.id] ?? "";

                return (
                  <fieldset key={grupo.id} className="min-w-0 flex-1 border-0 p-0">
                    <legend className="mb-2 font-sans text-xs uppercase tracking-[0.1em] text-oliva">
                      {grupo.etiqueta}
                    </legend>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {grupo.opciones.map((opcion) => {
                        const id = `${pregunta.id}-${fila.valor}-${grupo.id}-${opcion.valor}`;
                        const marcado = elegido === opcion.valor;

                        return (
                          <label
                            key={opcion.valor}
                            htmlFor={id}
                            className={`flex min-h-[44px] cursor-pointer items-center justify-center border-2 px-2 text-center font-sans text-sm leading-tight transition-colors peer-focus-visible:foco-marca ${
                              marcado
                                ? "border-mostaza bg-mostaza/10 font-medium text-negro"
                                : "border-negro/15 bg-white text-negro hover:border-negro/40"
                            }`}
                          >
                            <input
                              id={id}
                              type="radio"
                              name={`${pregunta.id}-${fila.valor}-${grupo.id}`}
                              value={opcion.valor}
                              checked={marcado}
                              onChange={() => marcar(fila.valor, grupo.id, opcion.valor)}
                              className="peer sr-only"
                            />
                            {opcion.texto}
                          </label>
                        );
                      })}
                    </div>

                    {error && (
                      <p role="alert" className="mt-1.5 font-sans text-sm text-alerta">
                        {error}
                      </p>
                    )}
                  </fieldset>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Campo>
  );
}
