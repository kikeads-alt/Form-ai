"use client";

import { useState } from "react";

/**
 * Copia al portapapeles con respaldo.
 *
 * `navigator.clipboard` exige contexto seguro; si no está, se cae a un textarea
 * temporal para no dejar el botón muerto en localhost sin HTTPS.
 */
export function CopiarTexto({
  texto,
  etiqueta,
  destacado = false,
}: {
  texto: string;
  etiqueta: string;
  destacado?: boolean;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
      } else {
        const area = document.createElement("textarea");
        area.value = texto;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className={`min-h-[44px] border-2 px-4 font-sans text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
        destacado
          ? "border-negro bg-negro text-crema hover:bg-carbon"
          : "border-negro/25 bg-transparent text-negro hover:border-negro"
      }`}
    >
      {copiado ? "Copiado ✓" : etiqueta}
    </button>
  );
}
