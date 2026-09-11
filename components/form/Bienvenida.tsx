"use client";

import { Boton } from "@/components/ui/Boton";
import { BIENVENIDA, SECCIONES } from "@/lib/questions";
import { hace } from "@/lib/storage";

export function Bienvenida({
  borradorPrevio,
  onEmpezar,
  onRetomar,
}: {
  borradorPrevio: { actualizado: string; seccion: number } | null;
  onEmpezar: () => void;
  onRetomar: () => void;
}) {
  return (
    <div className="mx-auto max-w-lectura px-5 py-14 sm:py-20">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-mostaza">
        Capacitación 1:1
      </p>

      <h1 className="titular mt-2 text-d-lg leading-[0.88] text-negro sm:text-d-xl">
        {BIENVENIDA.titular}
      </h1>

      <p className="mt-6 font-sans text-[17px] leading-relaxed text-carbon">
        {BIENVENIDA.texto}
      </p>

      <ul className="lista-kike mt-8 flex flex-col gap-2 font-sans text-sm text-oliva">
        <li>{SECCIONES.length} secciones, una pantalla cada una</li>
        <li>Se guarda solo: puedes cerrar y volver</li>
        <li>La última sección es opcional</li>
      </ul>

      {borradorPrevio ? (
        <div className="mt-10">
          <div className="border-l-[3px] border-mostaza bg-mostaza/10 px-4 py-3">
            <p className="font-sans text-sm leading-relaxed text-carbon">
              Tienes un avance guardado {hace(borradorPrevio.actualizado)}, en la sección{" "}
              {Math.min(borradorPrevio.seccion + 1, SECCIONES.length)}.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Boton onClick={onRetomar}>Retomar donde quedé</Boton>
            <Boton variante="secundario" onClick={onEmpezar}>
              Empezar de cero
            </Boton>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <Boton onClick={onEmpezar}>{BIENVENIDA.boton}</Boton>
        </div>
      )}
    </div>
  );
}
