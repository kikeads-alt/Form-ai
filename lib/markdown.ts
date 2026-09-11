import { claveOtro } from "./conditions";
import { elegidosDerivados, textoDeOpcion } from "./derived";
import { SECCIONES } from "./questions";
import type {
  ArchivoSubido,
  BanderaActiva,
  Pregunta,
  Respuestas,
} from "./types";

export interface EnvioParaTexto {
  nombre: string;
  correo: string;
  cargo: string;
  empresa: string;
  createdAt: Date;
  respuestas: Respuestas;
  archivos: ArchivoSubido[];
  banderas: BanderaActiva[];
  versionFormulario: string;
}

const FECHA = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" });

/* ═══════════════════════════════════════════════════════════════════════════
 * Formato de valores
 * ═══════════════════════════════════════════════════════════════════════════ */

function listaDeValores(pregunta: Pregunta, valor: unknown, respuestas: Respuestas): string {
  if (!Array.isArray(valor)) return "—";
  return valor.map((v) => textoDeOpcion(pregunta.id, String(v), respuestas)).join(", ");
}

/**
 * Texto de una respuesta, resuelto contra el esquema.
 *
 * `markdown` solo cambia el énfasis: el panel lo pinta como texto plano y los
 * botones de copiado lo piden con marcas, para que al pegarlo en Claude se vea
 * la jerarquía. El contenido es el mismo en ambos casos.
 */
export function valorLegible(
  pregunta: Pregunta,
  respuestas: Respuestas,
  markdown = false,
): string {
  const valor = respuestas[pregunta.id];
  if (valor === undefined || valor === null || valor === "") return "—";

  switch (pregunta.tipo) {
    case "nota":
      return "";

    case "texto":
    case "email":
    case "textoLargo":
      return String(valor);

    case "opcionUnica":
      return textoDeOpcion(pregunta.id, String(valor), respuestas);

    case "opcionMultiple":
      return listaDeValores(pregunta, valor, respuestas);

    case "escala":
      return `${valor} de ${pregunta.max}`;

    case "derivadaSelect": {
      const elegidos = elegidosDerivados(pregunta.id, respuestas);
      if (elegidos.length === 0) return "—";
      return elegidos.map((e, i) => `${i + 1}. ${e.texto}`).join("\n");
    }

    case "derivadaTextoLargo": {
      const campos = elegidosDerivados(pregunta.desde, respuestas);
      const datos = valor as Record<string, string>;
      const titulo = (texto: string) => (markdown ? `**${texto}**` : `${texto}:`);
      return campos
        .map((c) => `${titulo(c.texto)}\n${datos[c.valor]?.trim() || "—"}`)
        .join("\n\n");
    }

    case "cuadricula": {
      const filas = elegidosDerivados(pregunta.filasDesde, respuestas);
      const datos = valor as Record<string, Record<string, string>>;
      return filas
        .map((fila) => {
          const partes = pregunta.grupos.map((grupo) => {
            const elegido = datos[fila.valor]?.[grupo.id];
            const texto =
              grupo.opciones.find((o) => o.valor === elegido)?.texto ?? "—";
            return `${grupo.etiqueta}: ${texto}`;
          });
          return `- ${fila.texto} — ${partes.join(" · ")}`;
        })
        .join("\n");
    }

    case "archivos": {
      const archivos = valor as ArchivoSubido[];
      if (archivos.length === 0) return "—";
      return archivos
        .map((a) => (markdown ? `- [${a.nombre}](${a.url})` : `- ${a.nombre}`))
        .join("\n");
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 1 · Volcado completo
 * ═══════════════════════════════════════════════════════════════════════════ */

export function markdownRespuestas(envio: EnvioParaTexto): string {
  const lineas: string[] = [];

  lineas.push(`# Onboarding — ${envio.nombre}`);
  lineas.push("");
  lineas.push(`**Empresa:** ${envio.empresa}`);
  lineas.push(`**Cargo:** ${envio.cargo}`);
  lineas.push(`**Correo:** ${envio.correo}`);
  lineas.push(`**Recibido:** ${FECHA.format(envio.createdAt)}`);
  lineas.push(`**Versión del formulario:** ${envio.versionFormulario}`);
  lineas.push("");

  if (envio.banderas.length > 0) {
    lineas.push("## Banderas");
    lineas.push("");
    for (const bandera of envio.banderas) {
      lineas.push(`- **${bandera.etiqueta}** (${bandera.severidad}) — ${bandera.implicacion}`);
    }
    lineas.push("");
  }

  for (const seccion of SECCIONES) {
    const preguntas = seccion.preguntas.filter(
      (p) => p.tipo !== "nota" && envio.respuestas[p.id] !== undefined,
    );
    if (preguntas.length === 0) continue;

    lineas.push(`## ${seccion.titulo}`);
    lineas.push("");

    for (const pregunta of preguntas) {
      lineas.push(`**${pregunta.etiqueta}**`);
      lineas.push("");
      lineas.push(valorLegible(pregunta, envio.respuestas, true));
      lineas.push("");
    }
  }

  // Respuestas de versiones anteriores cuya pregunta ya no existe en el
  // esquema. Se imprimen en crudo antes que perderlas.
  const conocidas = new Set(
    SECCIONES.flatMap((s) => s.preguntas).flatMap((p) => [p.id, claveOtro(p.id)]),
  );
  const huerfanas = Object.entries(envio.respuestas).filter(([k]) => !conocidas.has(k));

  if (huerfanas.length > 0) {
    lineas.push("## Respuestas de una versión anterior del formulario");
    lineas.push("");
    for (const [clave, valor] of huerfanas) {
      lineas.push(`- \`${clave}\`: ${JSON.stringify(valor)}`);
    }
    lineas.push("");
  }

  return lineas.join("\n").trim();
}

/* ═══════════════════════════════════════════════════════════════════════════
 * 2 · Brief de clase
 *
 * No es un volcado: es el envío reordenado como instrucción, para pegarlo en un
 * proyecto de Claude y empezar a diseñar las sesiones sin releer 29 respuestas.
 * ═══════════════════════════════════════════════════════════════════════════ */

function respuestaCruda(respuestas: Respuestas, id: string): string {
  const pregunta = SECCIONES.flatMap((s) => s.preguntas).find((p) => p.id === id);
  if (!pregunta) return "—";
  return valorLegible(pregunta, respuestas, true);
}

export function markdownBrief(envio: EnvioParaTexto): string {
  const r = envio.respuestas;
  const lineas: string[] = [];

  lineas.push(`# Brief de clase — ${envio.nombre}, ${envio.empresa}`);
  lineas.push("");
  lineas.push(
    "Contexto para diseñar las sesiones 1:1. Todo lo que sigue son respuestas " +
      "del propio participante en el formulario de onboarding.",
  );
  lineas.push("");

  /* Perfil */
  lineas.push("## Quién es");
  lineas.push("");
  lineas.push(`- **Cargo:** ${envio.cargo}`);
  lineas.push(`- **Empresa y sector:** ${envio.empresa}`);
  lineas.push(`- **Personas que dependen de su información:** ${respuestaCruda(r, "personas_dependen")}`);
  lineas.push(`- **Funciones absorbidas fuera de su cargo:** ${respuestaCruda(r, "funciones_absorbidas")}`);
  lineas.push(`- **Nivel declarado con IA:** ${respuestaCruda(r, "nivel_ia")}`);
  lineas.push(`- **Herramientas de IA que usa:** ${respuestaCruda(r, "herramientas_ia")}`);
  if (r.usos_ia) {
    lineas.push(`- **Para qué las usa:** ${respuestaCruda(r, "usos_ia")}`);
  }
  lineas.push("");

  /* Las tres tareas, cruzadas con frecuencia y tiempo */
  const tareas = elegidosDerivados("tres_tareas", r);
  if (tareas.length > 0) {
    lineas.push("## Las tres tareas que más tiempo le quitan");
    lineas.push("");

    const detalles = (r.detalle_tareas ?? {}) as Record<string, string>;
    const matriz = (r.frecuencia_tiempo ?? {}) as Record<string, Record<string, string>>;

    tareas.forEach((tarea, i) => {
      const frecuencia = textoDeGrupo("frecuencia_tiempo", "frecuencia", matriz[tarea.valor]?.frecuencia);
      const tiempo = textoDeGrupo("frecuencia_tiempo", "tiempo", matriz[tarea.valor]?.tiempo);

      lineas.push(`### ${i + 1}. ${tarea.texto}`);
      lineas.push("");
      lineas.push(`**Frecuencia:** ${frecuencia} · **Tiempo por vez:** ${tiempo}`);
      lineas.push("");
      lineas.push(detalles[tarea.valor]?.trim() || "_Sin descripción._");
      lineas.push("");
    });

    lineas.push(`**Otras personas la hacen:** ${respuestaCruda(r, "quien_mas_hace")}`);
    lineas.push("");
  }

  /* Lo que condiciona el diseño */
  lineas.push("## Lo que obliga a rediseñar la clase");
  lineas.push("");
  if (envio.banderas.length === 0) {
    lineas.push("Sin banderas activas. Caso limpio.");
  } else {
    for (const bandera of envio.banderas) {
      lineas.push(`- **${bandera.etiqueta}** (${bandera.severidad}). ${bandera.implicacion}`);
    }
  }
  lineas.push("");

  /* Entorno técnico */
  lineas.push("## Entorno técnico y operativo");
  lineas.push("");
  lineas.push(`- **Cuenta de Claude:** ${respuestaCruda(r, "plan_claude")}`);
  lineas.push(`- **Computador:** ${respuestaCruda(r, "computador")}`);
  if (r.permisos_instalacion) {
    lineas.push(`- **Permisos de instalación:** ${respuestaCruda(r, "permisos_instalacion")}`);
  }
  lineas.push(`- **Sistemas internos:** ${respuestaCruda(r, "sistemas_internos")}`);
  if (r.nombre_sistema) {
    lineas.push(`- **Sistema principal:** ${respuestaCruda(r, "nombre_sistema")}`);
  }
  if (r.exportacion) {
    lineas.push(`- **Puede exportar:** ${respuestaCruda(r, "exportacion")}`);
  }
  lineas.push(`- **Fuentes del informe principal:** ${respuestaCruda(r, "fuentes_informe")}`);
  lineas.push(`- **Formato de entrega:** ${respuestaCruda(r, "formato_informe")}`);
  lineas.push(`- **Qué entiende por dashboard:** ${respuestaCruda(r, "idea_dashboard")}`);
  lineas.push(`- **Gestión de tareas:** ${respuestaCruda(r, "gestion_tareas")}`);
  lineas.push(`- **Dónde viven los archivos:** ${respuestaCruda(r, "donde_archivos")}`);
  lineas.push("");

  /* Procesos */
  lineas.push("## Estado de sus procesos");
  lineas.push("");
  lineas.push(`- **Documentación:** ${respuestaCruda(r, "procesos_documentados")}`);
  lineas.push(`- **Dónde vive:** ${respuestaCruda(r, "donde_documentacion")}`);
  lineas.push(`- **Cuando entra alguien nuevo:** ${respuestaCruda(r, "entrada_nuevo")}`);
  lineas.push("");

  /* Confidencialidad */
  lineas.push("## Qué no puede salir de la empresa");
  lineas.push("");
  lineas.push(`- **Restricciones:** ${respuestaCruda(r, "restricciones")}`);
  lineas.push(`- **Decisión sobre usar datos:** ${respuestaCruda(r, "decision_datos")}`);
  lineas.push("");

  /* Expectativas, en sus palabras */
  lineas.push("## Qué espera, en sus palabras");
  lineas.push("");
  lineas.push("**Valió la pena si al terminar puede:**");
  lineas.push("");
  lineas.push(respuestaCruda(r, "vale_la_pena"));
  lineas.push("");
  lineas.push("**Sentiría que perdió el tiempo si:**");
  lineas.push("");
  lineas.push(respuestaCruda(r, "perdida_tiempo"));
  lineas.push("");

  /* Muestras */
  lineas.push("## Material propio");
  lineas.push("");
  lineas.push(`- **Cómo prefirió compartir:** ${respuestaCruda(r, "compartir_muestras")}`);
  if (envio.archivos.length > 0) {
    lineas.push("- **Archivos:**");
    for (const archivo of envio.archivos) {
      lineas.push(`  - [${archivo.nombre}](${archivo.url})`);
    }
  }
  if (r.descripcion_informe) {
    lineas.push("");
    lineas.push("**Describió su informe así:**");
    lineas.push("");
    lineas.push(respuestaCruda(r, "descripcion_informe"));
  }

  return lineas.join("\n").trim();
}

/** Texto de una opción dentro de un grupo de cuadrícula. */
function textoDeGrupo(idPregunta: string, idGrupo: string, valor?: string): string {
  if (!valor) return "sin responder";
  const pregunta = SECCIONES.flatMap((s) => s.preguntas).find((p) => p.id === idPregunta);
  if (!pregunta || pregunta.tipo !== "cuadricula") return valor;
  const grupo = pregunta.grupos.find((g) => g.id === idGrupo);
  return grupo?.opciones.find((o) => o.valor === valor)?.texto ?? valor;
}
