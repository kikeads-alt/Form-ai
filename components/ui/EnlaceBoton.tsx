import Link from "next/link";
import type { ComponentProps } from "react";

import { ESTILOS_BOTON, type Variante } from "./estilosBoton";

/**
 * Un <Link> con la pinta de <Boton>, para acciones que navegan en vez de
 * disparar un evento (p. ej. "Ver formulario" desde el panel).
 */
export function EnlaceBoton({
  variante = "secundario",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante }) {
  return (
    <Link
      {...props}
      className={`inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${ESTILOS_BOTON[variante]} ${className}`}
    />
  );
}
