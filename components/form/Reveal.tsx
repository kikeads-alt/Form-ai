"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Apertura de los condicionales.
 *
 * Anima `grid-template-rows` de 0fr a 1fr, que es lo único que permite animar
 * "hasta la altura del contenido" sin medirlo a mano. Cuando está cerrado el
 * contenido se saca del árbol de accesibilidad y del orden de tabulación, para
 * que el teclado no caiga en campos invisibles.
 */
export function Reveal({ abierto, children }: { abierto: boolean; children: ReactNode }) {
  const [montado, setMontado] = useState(abierto);
  const primeraVez = useRef(true);

  useEffect(() => {
    if (abierto) {
      setMontado(true);
      return;
    }
    const t = setTimeout(() => setMontado(false), 340);
    return () => clearTimeout(t);
  }, [abierto]);

  useEffect(() => {
    primeraVez.current = false;
  }, []);

  if (!montado && !abierto) return null;

  return (
    <div
      className={`revelar ${abierto ? "revelar-abierto" : ""}`}
      // Cerrado: fuera del orden de tabulación y del árbol de accesibilidad.
      inert={!abierto}
    >
      <div className="revelar-interior">
        <div className="pb-1 pt-1">{children}</div>
      </div>
    </div>
  );
}
