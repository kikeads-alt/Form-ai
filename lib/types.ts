/**
 * Tipos del esquema de preguntas.
 *
 * Este archivo define la forma; `lib/questions.ts` define el contenido.
 * El motor del formulario solo conoce estos tipos, nunca una pregunta concreta.
 */

/* ────────────────────────────────────────────────────────────
 * Condiciones
 *
 * Se usan para dos cosas con el mismo evaluador (`lib/conditions.ts`):
 * mostrar preguntas condicionales y disparar banderas.
 * ──────────────────────────────────────────────────────────── */

export type Condicion =
  /** La respuesta (opción única) es alguno de estos valores. */
  | { pregunta: string; es: string[] }
  /** La respuesta (opción múltiple) incluye alguno de estos valores. */
  | { pregunta: string; incluye: string[] }
  /** La respuesta incluye algún valor que NO esté en la lista. Ej: "cualquiera menos Ninguno". */
  | { pregunta: string; incluyeAlgoDistintoDe: string[] }
  /** Hay respuesta, sea cual sea. */
  | { pregunta: string; respondida: true }
  | { todas: Condicion[] }
  | { alguna: Condicion[] }
  | { no: Condicion };

/* ────────────────────────────────────────────────────────────
 * Opciones
 * ──────────────────────────────────────────────────────────── */

export interface Opcion {
  /**
   * Clave estable. Es lo que se guarda en la base y contra lo que se evalúan
   * las condiciones y las banderas. Cambiar `texto` es seguro; cambiar `valor`
   * rompe los envíos anteriores.
   */
  valor: string;
  texto: string;
  /** Marca opciones excluyentes ("Ninguna", "No uso ninguna"): al elegirlas se deseleccionan las demás. */
  excluyente?: boolean;
}

/* ────────────────────────────────────────────────────────────
 * Preguntas
 * ──────────────────────────────────────────────────────────── */

interface PreguntaBase {
  /**
   * Identificador semántico y estable. Es la clave dentro de `respuestas` (jsonb).
   * No lleva número a propósito: si la pregunta cambia de posición, el id no cambia
   * y los envíos viejos se siguen leyendo.
   */
  id: string;
  /** Número visible para el participante. Es presentación: se puede reordenar sin tocar el id. */
  numero?: number;
  etiqueta: string;
  ayuda?: string;
  /** Aviso importante. Se pinta como bloque con borde mostaza, no como texto mostaza. */
  ayudaDestacada?: string;
  obligatoria?: boolean;
  visibleSi?: Condicion;
}

export interface PreguntaTexto extends PreguntaBase {
  tipo: "texto" | "email";
  placeholder?: string;
  maxCaracteres?: number;
}

export interface PreguntaTextoLargo extends PreguntaBase {
  tipo: "textoLargo";
  placeholder?: string;
  minCaracteres?: number;
  maxCaracteres?: number;
  filas?: number;
}

export interface PreguntaOpcionUnica extends PreguntaBase {
  tipo: "opcionUnica";
  opciones: Opcion[];
  permiteOtro?: boolean;
}

export interface PreguntaOpcionMultiple extends PreguntaBase {
  tipo: "opcionMultiple";
  opciones: Opcion[];
  permiteOtro?: boolean;
  minSelecciones?: number;
}

export interface PreguntaEscala extends PreguntaBase {
  tipo: "escala";
  min: number;
  max: number;
  etiquetaMin: string;
  etiquetaMax: string;
}

/** Desplegables alimentados por lo que el participante eligió en otra pregunta. */
export interface PreguntaDerivadaSelect extends PreguntaBase {
  tipo: "derivadaSelect";
  /** Id de la pregunta de opción múltiple que alimenta las opciones. */
  desde: string;
  /** Máximo de desplegables. Si el participante eligió menos opciones, se muestran menos. */
  cantidad: number;
  sinRepetir?: boolean;
  /** Etiqueta de cada desplegable, en orden. */
  etiquetasCampos?: string[];
}

/** Un campo de texto largo por cada elemento elegido en una pregunta derivada. */
export interface PreguntaDerivadaTextoLargo extends PreguntaBase {
  tipo: "derivadaTextoLargo";
  /** Id de la `derivadaSelect` cuyas elecciones generan los campos. */
  desde: string;
  minCaracteres?: number;
  filas?: number;
  placeholder?: string;
}

export interface GrupoCuadricula {
  id: string;
  etiqueta: string;
  opciones: Opcion[];
}

/** Cuadrícula en escritorio, tarjetas apiladas en móvil. */
export interface PreguntaCuadricula extends PreguntaBase {
  tipo: "cuadricula";
  /** Id de la `derivadaSelect` que define las filas. */
  filasDesde: string;
  grupos: GrupoCuadricula[];
}

export interface PreguntaArchivos extends PreguntaBase {
  tipo: "archivos";
  maxArchivos: number;
  maxMB: number;
  /** Extensiones permitidas, sin punto. */
  formatos: string[];
  sugerencias?: string[];
}

/** Bloque de texto sin campo asociado. Sirve para mensajes condicionales. */
export interface PreguntaNota extends PreguntaBase {
  tipo: "nota";
  texto: string;
  variante: "oliva" | "mostaza";
}

export type Pregunta =
  | PreguntaTexto
  | PreguntaTextoLargo
  | PreguntaOpcionUnica
  | PreguntaOpcionMultiple
  | PreguntaEscala
  | PreguntaDerivadaSelect
  | PreguntaDerivadaTextoLargo
  | PreguntaCuadricula
  | PreguntaArchivos
  | PreguntaNota;

export type TipoPregunta = Pregunta["tipo"];

/* ────────────────────────────────────────────────────────────
 * Secciones
 * ──────────────────────────────────────────────────────────── */

export interface Seccion {
  id: string;
  /** Se recalcula al renderizar; aquí solo importa el orden del arreglo. */
  titulo: string;
  encabezado?: string;
  opcional?: boolean;
  preguntas: Pregunta[];
}

/* ────────────────────────────────────────────────────────────
 * Respuestas
 * ──────────────────────────────────────────────────────────── */

export type ValorRespuesta =
  | string
  | number
  | string[]
  | Record<string, string>
  | Record<string, Record<string, string>>
  | ArchivoSubido[]
  | null;

export type Respuestas = Record<string, ValorRespuesta>;

export interface ArchivoSubido {
  nombre: string;
  url: string;
  tipo: string;
  tamano: number;
}

/* ────────────────────────────────────────────────────────────
 * Banderas
 * ──────────────────────────────────────────────────────────── */

export type Severidad = "alta" | "media" | "baja";

export interface DefinicionBandera {
  id: string;
  etiqueta: string;
  severidad: Severidad;
  cuando: Condicion;
  /** Qué implica para el diseño de la clase. Se guarda junto con la bandera. */
  implicacion: string;
}

export interface BanderaActiva {
  id: string;
  etiqueta: string;
  severidad: Severidad;
  implicacion: string;
}

/* ────────────────────────────────────────────────────────────
 * Envíos
 * ──────────────────────────────────────────────────────────── */

export type EstadoEnvio = "nueva" | "revisada" | "procesada";

export const ESTADOS: { valor: EstadoEnvio; texto: string }[] = [
  { valor: "nueva", texto: "Nueva" },
  { valor: "revisada", texto: "Revisada" },
  { valor: "procesada", texto: "Procesada" },
];
