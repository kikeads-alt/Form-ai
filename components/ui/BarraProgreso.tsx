export function BarraProgreso({ actual, total }: { actual: number; total: number }) {
  const porcentaje = Math.round((actual / total) * 100);

  return (
    <div className="border-b border-negro/10 bg-crema">
      <div className="mx-auto max-w-lectura px-5 pb-3 pt-4">
        <p className="text-right font-sans text-xs uppercase tracking-[0.12em] text-oliva">
          Sección {actual} de {total}
        </p>
        <div
          className="mt-2 h-1.5 w-full bg-negro/10"
          role="progressbar"
          aria-valuenow={actual}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Sección ${actual} de ${total}`}
        >
          <div
            className="h-full bg-mostaza transition-[width] duration-300 ease-out"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>
    </div>
  );
}
