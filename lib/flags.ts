import { evaluarCondicion } from "./conditions";
import { BANDERAS } from "./questions";
import type { BanderaActiva, Respuestas, Severidad } from "./types";

const ORDEN: Record<Severidad, number> = { alta: 0, media: 1, baja: 2 };

/**
 * Calcula las banderas de un envío.
 *
 * Se guardan resueltas (con etiqueta e implicación incluidas) y no solo por id:
 * así un envío de hace seis meses se sigue leyendo igual aunque hoy hayas
 * reescrito el texto de la bandera o la hayas eliminado del catálogo.
 */
export function calcularBanderas(respuestas: Respuestas): BanderaActiva[] {
  return BANDERAS.filter((b) => evaluarCondicion(b.cuando, respuestas))
    .map(({ id, etiqueta, severidad, implicacion }) => ({
      id,
      etiqueta,
      severidad,
      implicacion,
    }))
    .sort((a, b) => ORDEN[a.severidad] - ORDEN[b.severidad]);
}

/** Clases de color por severidad. Rojo para alta, mostaza media, oliva baja. */
export const ESTILO_SEVERIDAD: Record<Severidad, string> = {
  alta: "border-alerta bg-alerta text-crema",
  media: "border-mostaza bg-mostaza text-negro",
  baja: "border-oliva bg-oliva text-crema",
};

export const ESTILO_SEVERIDAD_SUAVE: Record<Severidad, string> = {
  alta: "border-alerta bg-alerta/10 text-alerta",
  media: "border-mostaza bg-mostaza/10 text-carbon",
  baja: "border-oliva bg-oliva/10 text-oliva",
};
