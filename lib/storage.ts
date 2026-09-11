import { VERSION_FORMULARIO } from "./questions";
import type { Respuestas } from "./types";

/**
 * Guardado local del avance.
 *
 * La clave lleva la versión del formulario: si subes VERSION_FORMULARIO, los
 * borradores viejos dejan de cargarse en vez de mezclarse con preguntas que
 * ya no existen.
 */
const CLAVE = `kikeads:onboarding:${VERSION_FORMULARIO}`;

export interface Borrador {
  version: string;
  actualizado: string;
  seccion: number;
  respuestas: Respuestas;
  /** Token del borrador en servidor, si ya se creó. */
  token?: string;
}

export function guardarLocal(borrador: Omit<Borrador, "version" | "actualizado">): void {
  if (typeof window === "undefined") return;
  try {
    const dato: Borrador = {
      ...borrador,
      version: VERSION_FORMULARIO,
      actualizado: new Date().toISOString(),
    };
    window.localStorage.setItem(CLAVE, JSON.stringify(dato));
  } catch {
    // Navegación privada o cuota llena: el formulario sigue funcionando,
    // simplemente sin red de seguridad.
  }
}

export function leerLocal(): Borrador | null {
  if (typeof window === "undefined") return null;
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const dato = JSON.parse(crudo) as Borrador;
    if (dato.version !== VERSION_FORMULARIO) return null;
    if (!dato.respuestas || typeof dato.respuestas !== "object") return null;
    return dato;
  } catch {
    return null;
  }
}

export function borrarLocal(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    /* sin consecuencias */
  }
}

/** "hace 2 horas", para el aviso de retomar. */
export function hace(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutos = Math.round(ms / 60000);
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} minuto${minutos === 1 ? "" : "s"}`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} hora${horas === 1 ? "" : "s"}`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} día${dias === 1 ? "" : "s"}`;
}
