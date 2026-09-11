import { ESTILO_SEVERIDAD, ESTILO_SEVERIDAD_SUAVE } from "@/lib/flags";
import type { BanderaActiva } from "@/lib/types";

export function BanderaEtiqueta({ bandera }: { bandera: BanderaActiva }) {
  return (
    <span
      className={`inline-block border px-2 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] ${ESTILO_SEVERIDAD[bandera.severidad]}`}
    >
      {bandera.etiqueta}
    </span>
  );
}

/** Versión con la implicación visible, para la cabecera del detalle. */
export function BanderaDetalle({ bandera }: { bandera: BanderaActiva }) {
  return (
    <div
      className={`border-l-[3px] px-4 py-3 ${ESTILO_SEVERIDAD_SUAVE[bandera.severidad]}`}
    >
      <p className="font-sans text-sm font-semibold uppercase tracking-[0.06em]">
        {bandera.etiqueta}
        <span className="ml-2 font-normal normal-case tracking-normal opacity-70">
          severidad {bandera.severidad}
        </span>
      </p>
      <p className="mt-1 font-sans text-sm leading-relaxed text-carbon">
        {bandera.implicacion}
      </p>
    </div>
  );
}
