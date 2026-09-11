import type { Errores } from "@/lib/validation";
import type { Respuestas, ValorRespuesta } from "@/lib/types";

export interface PropsControl<P> {
  pregunta: P;
  respuestas: Respuestas;
  errores: Errores;
  onChange: (id: string, valor: ValorRespuesta) => void;
}

/** Estilos compartidos de los campos de escritura. */
export const ENTRADA =
  "w-full min-h-[48px] border-2 border-negro/15 bg-white px-4 py-3 font-sans text-base text-negro placeholder:text-oliva/50 focus-visible:border-negro";

export const ENTRADA_ERROR = "border-alerta";

/** 17.1 → "17a", 24.1 → "24a". El decimal es el orden del subapartado. */
export function numeroVisible(numero: number): string {
  const [entero, decimal] = String(numero).split(".");
  if (!decimal) return entero;
  return `${entero}${String.fromCharCode(96 + Number(decimal))}`;
}
