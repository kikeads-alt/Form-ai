"use client";

import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "texto";

const ESTILOS: Record<Variante, string> = {
  primario:
    "bg-negro text-crema border-2 border-negro hover:bg-carbon disabled:bg-oliva/40 disabled:border-oliva/40 disabled:text-crema",
  secundario:
    "bg-transparent text-negro border-2 border-negro/25 hover:border-negro disabled:opacity-40",
  texto: "bg-transparent text-oliva border-2 border-transparent underline hover:text-negro",
};

export function Boton({
  variante = "primario",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      {...props}
      className={`min-h-[48px] px-6 py-3 font-sans text-sm font-semibold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed ${ESTILOS[variante]} ${className}`}
    />
  );
}
