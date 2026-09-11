import type { Metadata } from "next";

import { CIERRE } from "@/lib/questions";

export const metadata: Metadata = { title: "Listo · kikeads_" };

export default function Gracias() {
  return (
    <div className="mx-auto max-w-lectura px-5 py-20 sm:py-28">
      <h1 className="titular text-d-lg leading-[0.88] text-negro sm:text-d-xl">
        {CIERRE.titular}
      </h1>

      <p className="mt-6 font-sans text-[17px] leading-relaxed text-carbon">{CIERRE.texto}</p>

      <p className="mt-12 border-t border-negro/15 pt-6 font-sans text-sm text-oliva">
        {CIERRE.firma}
      </p>
    </div>
  );
}
