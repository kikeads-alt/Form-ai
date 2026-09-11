import type { ReactNode } from "react";

/**
 * Aviso destacado.
 *
 * El mostaza como texto sobre crema da 2.0:1 y no cumple AA, así que el acento
 * va en el borde y en un fondo al 10%, y el texto se queda en carbón.
 */
export function Callout({
  variante = "mostaza",
  children,
}: {
  variante?: "mostaza" | "oliva";
  children: ReactNode;
}) {
  const estilo =
    variante === "mostaza"
      ? "border-l-[3px] border-mostaza bg-mostaza/10 text-carbon"
      : "border-l-[3px] border-oliva bg-oliva/10 text-oliva";

  return (
    <div className={`mt-3 px-4 py-3 text-sm leading-relaxed ${estilo}`}>{children}</div>
  );
}
