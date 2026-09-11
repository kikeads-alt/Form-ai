"use client";

/**
 * Una opción marcable.
 *
 * El input real existe y recibe el foco (navegación por teclado intacta), pero
 * está oculto visualmente: lo que se ve es la etiqueta completa, que además es
 * el área táctil. Mínimo 52px de alto para el uso con el pulgar.
 */
export function OpcionCaja({
  tipo,
  name,
  id,
  valor,
  texto,
  marcada,
  onSelect,
}: {
  tipo: "radio" | "checkbox";
  name: string;
  id: string;
  valor: string;
  texto: string;
  marcada: boolean;
  onSelect: (valor: string) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`group relative flex min-h-[52px] cursor-pointer items-start gap-3 border-2 px-4 py-3 transition-colors peer-focus-visible:foco-marca ${
        marcada
          ? "border-mostaza bg-mostaza/10"
          : "border-negro/15 bg-white hover:border-negro/40"
      }`}
    >
      <input
        id={id}
        type={tipo}
        name={name}
        value={valor}
        checked={marcada}
        onChange={() => onSelect(valor)}
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        className={`mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors ${
          tipo === "radio" ? "rounded-full" : "rounded-sm"
        } ${marcada ? "border-negro bg-negro" : "border-negro/30 bg-white"}`}
      >
        {marcada &&
          (tipo === "radio" ? (
            <span className="h-1.5 w-1.5 rounded-full bg-crema" />
          ) : (
            <svg viewBox="0 0 12 12" className="h-3 w-3 text-crema" fill="none">
              <path
                d="M2 6.2 4.8 9 10 3.4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
          ))}
      </span>

      <span className="font-sans text-[15px] leading-snug text-negro">{texto}</span>
    </label>
  );
}
