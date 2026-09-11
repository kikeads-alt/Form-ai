"use client";

import { useTransition } from "react";

import { actualizarEstado } from "@/app/admin/acciones";
import { ESTADOS, type EstadoEnvio } from "@/lib/types";

export function SelectorEstado({ id, estado }: { id: string; estado: EstadoEnvio }) {
  const [pendiente, iniciar] = useTransition();

  return (
    <label className="flex items-center gap-2">
      <span className="font-sans text-xs uppercase tracking-[0.1em] text-oliva">Estado</span>
      <select
        value={estado}
        disabled={pendiente}
        onChange={(e) =>
          iniciar(() => {
            void actualizarEstado(id, e.target.value as EstadoEnvio);
          })
        }
        className="min-h-[44px] border-2 border-negro/15 bg-white px-3 font-sans text-sm disabled:opacity-50"
      >
        {ESTADOS.map((e) => (
          <option key={e.valor} value={e.valor}>
            {e.texto}
          </option>
        ))}
      </select>
    </label>
  );
}
