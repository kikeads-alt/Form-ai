import type { PreguntaNota } from "@/lib/types";

export function Nota({ pregunta }: { pregunta: PreguntaNota }) {
  const estilo =
    pregunta.variante === "oliva"
      ? "border-l-[3px] border-oliva bg-oliva/10 text-oliva"
      : "border-l-[3px] border-mostaza bg-mostaza/10 text-carbon";

  return (
    <p className={`px-4 py-3.5 font-sans text-[15px] leading-relaxed ${estilo}`}>
      {pregunta.texto}
    </p>
  );
}
