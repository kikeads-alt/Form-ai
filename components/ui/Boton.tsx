"use client";

import type { ButtonHTMLAttributes } from "react";

import { ESTILOS_BOTON, type Variante } from "./estilosBoton";

export type { Variante };

export function Boton({
  variante = "primario",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      {...props}
      className={`min-h-[48px] px-6 py-3 font-sans text-sm font-semibold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed ${ESTILOS_BOTON[variante]} ${className}`}
    />
  );
}
