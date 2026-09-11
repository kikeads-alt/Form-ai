export function Contador({ actual, minimo }: { actual: number; minimo: number }) {
  const cumple = actual >= minimo;

  return (
    <p
      className={`mt-1.5 text-right font-sans text-xs tabular-nums ${
        cumple ? "text-oliva" : "text-oliva/70"
      }`}
      aria-live="polite"
    >
      {cumple ? `${actual} caracteres` : `${actual} / ${minimo} caracteres mínimo`}
    </p>
  );
}
