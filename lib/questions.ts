import type { DefinicionBandera, Seccion } from "./types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CONTENIDO DEL FORMULARIO
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Este es el único archivo que hay que tocar para cambiar preguntas, opciones,
 * textos, condicionales o banderas. Ningún componente conoce una pregunta
 * concreta: el motor solo sabe interpretar los tipos de `lib/types.ts`.
 *
 * Reglas para no romper los envíos ya guardados:
 *
 *   1. El `id` de una pregunta y el `valor` de una opción son claves de base de
 *      datos. Se pueden reordenar y renumerar libremente, pero renombrarlos
 *      deja huérfanas las respuestas anteriores.
 *   2. El `texto` de una opción y la `etiqueta` de una pregunta son solo
 *      presentación. Cambiarlos es seguro y no requiere migración.
 *   3. Si haces un cambio que sí rompe compatibilidad (renombrar ids, quitar
 *      opciones que la gente ya eligió), sube VERSION_FORMULARIO. El panel
 *      muestra con qué versión respondió cada persona.
 *
 * Ver README.md → "Cómo agregar o modificar preguntas".
 */

export const VERSION_FORMULARIO = "2026-09-v1";

/* ═══════════════════════════════════════════════════════════════════════════
 * Pantallas de apertura y cierre
 * ═══════════════════════════════════════════════════════════════════════════ */

export const BIENVENIDA = {
  titular: "Antes de empezar.",
  texto:
    "Estas preguntas son para que las sesiones se construyan sobre tu trabajo real y no sobre ejemplos genéricos. Toma unos 20 minutos. Responde con sinceridad incómoda: si algo lo haces a mano o improvisando, dímelo tal cual, que ahí está el valor.",
  boton: "Empezar",
};

export const CIERRE = {
  titular: "Listo.",
  texto:
    "Gracias. Con esto preparo las sesiones sobre tu trabajo real. Si algo se me queda sin entender, te escribo antes de la primera clase.",
  firma: "Luis Enrique Barrantes · kikeads_",
};

/* ═══════════════════════════════════════════════════════════════════════════
 * Secciones
 * ═══════════════════════════════════════════════════════════════════════════ */

export const SECCIONES: Seccion[] = [
  /* ─── 1 ──────────────────────────────────────────────────────────────── */
  {
    id: "quien_eres",
    titulo: "Quién eres",
    preguntas: [
      {
        id: "nombre",
        numero: 1,
        tipo: "texto",
        etiqueta: "Nombre completo",
        obligatoria: true,
        maxCaracteres: 120,
      },
      {
        id: "correo",
        numero: 2,
        tipo: "email",
        etiqueta: "Correo",
        ayuda: "Aquí te escribo si algo me queda sin entender.",
        obligatoria: true,
        maxCaracteres: 160,
      },
      {
        id: "cargo",
        numero: 3,
        tipo: "texto",
        etiqueta: "Cargo formal",
        placeholder: "El que aparece en tu contrato",
        obligatoria: true,
        maxCaracteres: 120,
      },
      {
        id: "empresa",
        numero: 4,
        tipo: "texto",
        etiqueta: "Empresa y sector",
        placeholder: "Nombre de la empresa y a qué se dedica",
        obligatoria: true,
        maxCaracteres: 160,
      },
      {
        id: "personas_dependen",
        numero: 5,
        tipo: "opcionUnica",
        etiqueta:
          "¿Cuántas personas dependen de ti o de tu información para trabajar?",
        opciones: [
          { valor: "ninguna", texto: "Ninguna" },
          { valor: "1_3", texto: "1 a 3" },
          { valor: "4_10", texto: "4 a 10" },
          { valor: "mas_10", texto: "Más de 10" },
        ],
      },
      {
        id: "funciones_absorbidas",
        numero: 6,
        tipo: "opcionMultiple",
        etiqueta: "¿Has absorbido funciones que no corresponden a tu cargo?",
        permiteOtro: true,
        opciones: [
          { valor: "finanzas", texto: "Finanzas o contabilidad" },
          { valor: "inventario", texto: "Inventario y bodega" },
          { valor: "compras", texto: "Compras y proveedores" },
          { valor: "rrhh", texto: "Recursos humanos" },
          { valor: "operaciones", texto: "Operaciones" },
          { valor: "reporteria", texto: "Reportería y análisis" },
          { valor: "tecnologia", texto: "Tecnología y sistemas" },
          { valor: "marketing", texto: "Marketing" },
          { valor: "atencion_clientes", texto: "Atención a clientes" },
          { valor: "solo_mi_cargo", texto: "No, solo mi cargo", excluyente: true },
        ],
      },
    ],
  },

  /* ─── 2 ──────────────────────────────────────────────────────────────── */
  {
    id: "tareas_repetitivas",
    titulo: "Tus tareas repetitivas",
    preguntas: [
      {
        id: "tareas_repetitivas",
        numero: 7,
        tipo: "opcionMultiple",
        etiqueta: "¿Cuáles de estas tareas repites con la misma estructura?",
        ayuda: "Marca todas las que apliquen.",
        obligatoria: true,
        minSelecciones: 1,
        permiteOtro: true,
        opciones: [
          { valor: "informes_cierre", texto: "Informes de cierre de mes" },
          { valor: "reportes_direccion", texto: "Reportes de resultados para dirección" },
          {
            valor: "consolidar_fuentes",
            texto: "Consolidar información de varias fuentes en un solo documento",
          },
          {
            valor: "documentar_procesos",
            texto: "Documentar procesos o instructivos de puestos de trabajo",
          },
          { valor: "actas", texto: "Actas o minutas de reunión" },
          { valor: "correos_repetidos", texto: "Correos largos que se repiten con variaciones" },
          { valor: "seguimiento_equipo", texto: "Seguimiento de tareas del equipo" },
          { valor: "inventario", texto: "Control de inventario o recepción de mercancía" },
          { valor: "presupuestos", texto: "Presupuestos o proyecciones" },
          { valor: "conciliaciones", texto: "Conciliaciones o revisión de cifras" },
          { valor: "presentaciones", texto: "Presentaciones recurrentes" },
        ],
      },
      {
        id: "tres_tareas",
        numero: 8,
        tipo: "derivadaSelect",
        etiqueta: "De las que marcaste, elige las tres que más tiempo te quitan.",
        ayuda: "En orden: primero la que más te pesa.",
        obligatoria: true,
        desde: "tareas_repetitivas",
        cantidad: 3,
        sinRepetir: true,
        etiquetasCampos: ["La que más tiempo me quita", "La segunda", "La tercera"],
      },
      {
        id: "detalle_tareas",
        numero: 9,
        tipo: "derivadaTextoLargo",
        etiqueta:
          "Para cada una de esas tres: ¿qué haces exactamente, de dónde sacas la información y qué produces al final?",
        ayuda:
          "Escríbelo como se lo contarías a alguien que te va a reemplazar por una semana. Tres párrafos cortos bastan.",
        obligatoria: true,
        desde: "tres_tareas",
        minCaracteres: 120,
        filas: 5,
      },
      {
        id: "frecuencia_tiempo",
        numero: 10,
        tipo: "cuadricula",
        etiqueta: "Frecuencia y tiempo de cada tarea",
        filasDesde: "tres_tareas",
        grupos: [
          {
            id: "frecuencia",
            etiqueta: "Frecuencia",
            opciones: [
              { valor: "diaria", texto: "Diaria" },
              { valor: "semanal", texto: "Semanal" },
              { valor: "quincenal", texto: "Quincenal" },
              { valor: "mensual", texto: "Mensual" },
              { valor: "ocasional", texto: "Ocasional" },
            ],
          },
          {
            id: "tiempo",
            etiqueta: "Tiempo",
            opciones: [
              { valor: "menos_1h", texto: "Menos de 1h" },
              { valor: "1_3h", texto: "1 a 3h" },
              { valor: "3_8h", texto: "3 a 8h" },
              { valor: "mas_8h", texto: "Más de 8h" },
            ],
          },
        ],
      },
      {
        id: "quien_mas_hace",
        numero: 11,
        tipo: "opcionUnica",
        etiqueta: "¿Alguna de esas tres la hace también otra persona de tu equipo?",
        opciones: [
          { valor: "solo_yo", texto: "Solo yo" },
          { valor: "otra_persona", texto: "Otra persona hace algo parecido" },
          { valor: "varias_personas", texto: "Varias personas la hacen de formas distintas" },
          {
            valor: "deberia_otro",
            texto: "Debería hacerla alguien más pero termino haciéndola yo",
          },
        ],
      },
    ],
  },

  /* ─── 3 ──────────────────────────────────────────────────────────────── */
  {
    id: "procesos",
    titulo: "Estado de tus procesos",
    preguntas: [
      {
        id: "procesos_documentados",
        numero: 12,
        tipo: "opcionUnica",
        etiqueta: "¿Los procesos de tu área están documentados?",
        opciones: [
          { valor: "si_actualizados", texto: "Sí, documentados y actualizados" },
          { valor: "desactualizados", texto: "Documentados pero desactualizados" },
          { valor: "parcialmente", texto: "Parcialmente" },
          { valor: "en_la_cabeza", texto: "No, están en la cabeza de las personas" },
          { valor: "levantando", texto: "Estoy levantándolos ahora" },
        ],
      },
      {
        id: "donde_documentacion",
        numero: 13,
        tipo: "opcionMultiple",
        etiqueta: "¿Dónde vive esa documentación?",
        permiteOtro: true,
        opciones: [
          { valor: "docs_sueltos", texto: "Word o Google Docs sueltos" },
          { valor: "hojas_calculo", texto: "Excel o Google Sheets" },
          { valor: "manual_pdf", texto: "Manual formal en PDF" },
          { valor: "herramienta", texto: "Trello, Notion, ClickUp o similar" },
          { valor: "servidor", texto: "Servidor compartido" },
          { valor: "en_la_cabeza", texto: "En la cabeza de la gente" },
          { valor: "no_existe", texto: "No existe", excluyente: true },
        ],
      },
      {
        id: "entrada_nuevo",
        numero: 14,
        tipo: "opcionUnica",
        etiqueta: "¿Qué pasa hoy cuando alguien nuevo entra a un puesto?",
        permiteOtro: true,
        opciones: [
          { valor: "manual", texto: "Hay un manual que se le entrega" },
          { valor: "acompanamiento", texto: "Alguien lo acompaña y le enseña de palabra" },
          { valor: "sobre_la_marcha", texto: "Aprende sobre la marcha" },
          { valor: "depende", texto: "Depende de quién lo reciba" },
        ],
      },
    ],
  },

  /* ─── 4 ──────────────────────────────────────────────────────────────── */
  {
    id: "herramientas",
    titulo: "Herramientas y dónde vive la información",
    preguntas: [
      {
        id: "gestion_tareas",
        numero: 15,
        tipo: "opcionMultiple",
        etiqueta: "¿Dónde gestionas tareas y proyectos?",
        permiteOtro: true,
        opciones: [
          { valor: "trello", texto: "Trello" },
          { valor: "asana", texto: "Asana" },
          { valor: "monday", texto: "Monday" },
          { valor: "clickup", texto: "ClickUp" },
          { valor: "notion", texto: "Notion" },
          { valor: "jira", texto: "Jira" },
          { valor: "hojas_calculo", texto: "Excel o Sheets" },
          { valor: "correo", texto: "Correo" },
          { valor: "whatsapp", texto: "WhatsApp" },
          { valor: "papel", texto: "Papel o agenda física" },
          { valor: "ninguna", texto: "No uso ninguna", excluyente: true },
        ],
      },
      {
        id: "donde_archivos",
        numero: 16,
        tipo: "opcionMultiple",
        etiqueta: "¿Dónde viven tus archivos de trabajo?",
        permiteOtro: true,
        opciones: [
          { valor: "drive", texto: "Google Drive" },
          { valor: "onedrive", texto: "OneDrive o SharePoint" },
          { valor: "dropbox", texto: "Dropbox" },
          { valor: "servidor", texto: "Servidor de la empresa" },
          { valor: "mi_computador", texto: "Solo en mi computador" },
          { valor: "correo", texto: "Correo" },
        ],
      },
      {
        id: "sistemas_internos",
        numero: 17,
        tipo: "opcionMultiple",
        etiqueta: "¿Qué sistemas internos o de empresa usas para sacar información?",
        permiteOtro: true,
        opciones: [
          { valor: "erp", texto: "ERP (SAP, Siigo, World Office, Odoo…)" },
          { valor: "reporteria", texto: "Sistema de reportería interno" },
          { valor: "contable", texto: "Software contable" },
          { valor: "inventario", texto: "Sistema de inventario o bodega" },
          { valor: "crm", texto: "CRM" },
          { valor: "pos", texto: "Punto de venta" },
          { valor: "ninguno", texto: "Ninguno", excluyente: true },
        ],
      },
      {
        id: "nombre_sistema",
        numero: 17.1,
        tipo: "texto",
        etiqueta: "Nombre del sistema",
        placeholder: "Si son varios, el que más usas",
        maxCaracteres: 160,
        visibleSi: { pregunta: "sistemas_internos", incluyeAlgoDistintoDe: ["ninguno"] },
      },
      {
        id: "exportacion",
        numero: 17.2,
        tipo: "opcionUnica",
        etiqueta: "¿Puedes exportar información desde ahí?",
        ayudaDestacada:
          "Si no estás seguro, entra y verifica antes de responder. Esto define cómo diseñamos la segunda sesión.",
        visibleSi: { pregunta: "sistemas_internos", incluyeAlgoDistintoDe: ["ninguno"] },
        opciones: [
          { valor: "excel_csv", texto: "Sí, a Excel o CSV" },
          { valor: "solo_pdf", texto: "Sí, pero solo a PDF" },
          { valor: "solo_pantalla", texto: "Solo lo veo en pantalla, no exporta" },
          { valor: "no_seguro", texto: "No estoy seguro" },
        ],
      },
      {
        id: "fuentes_informe",
        numero: 18,
        tipo: "opcionUnica",
        etiqueta:
          "Para armar tu informe principal, ¿de cuántas fuentes distintas sacas información?",
        opciones: [
          { valor: "una", texto: "Una sola" },
          { valor: "dos_tres", texto: "Dos o tres" },
          { valor: "cuatro_seis", texto: "Cuatro a seis" },
          { valor: "mas_seis", texto: "Más de seis" },
          { valor: "depende", texto: "Depende del mes" },
        ],
      },
      {
        id: "formato_informe",
        numero: 19,
        tipo: "opcionMultiple",
        etiqueta: "¿En qué formato entregas ese informe?",
        permiteOtro: true,
        opciones: [
          { valor: "excel", texto: "Excel" },
          { valor: "word_pdf", texto: "Word o PDF" },
          { valor: "presentacion", texto: "Presentación" },
          { valor: "correo", texto: "Correo con el resumen escrito" },
          { valor: "verbal", texto: "Verbal en reunión" },
          { valor: "dashboard", texto: "Tablero o dashboard" },
        ],
      },
      {
        id: "idea_dashboard",
        numero: 20,
        tipo: "opcionUnica",
        etiqueta: 'Cuando piensas en "dashboard", ¿qué te imaginas?',
        opciones: [
          { valor: "informe_mensual", texto: "Un informe mensual con gráficos, que yo genero" },
          {
            valor: "tablero_auto",
            texto: "Un tablero que se actualiza solo al cargar datos nuevos",
          },
          {
            valor: "tablero_en_vivo",
            texto: "Un tablero conectado en vivo a los sistemas de la empresa",
          },
          { valor: "no_claro", texto: "No lo tengo claro todavía" },
        ],
      },
    ],
  },

  /* ─── 5 ──────────────────────────────────────────────────────────────── */
  {
    id: "punto_partida_ia",
    titulo: "Punto de partida con IA",
    preguntas: [
      {
        id: "herramientas_ia",
        numero: 21,
        tipo: "opcionMultiple",
        etiqueta: "¿Usas alguna herramienta de IA hoy?",
        permiteOtro: true,
        opciones: [
          { valor: "claude", texto: "Claude" },
          { valor: "chatgpt", texto: "ChatGPT" },
          { valor: "gemini", texto: "Gemini" },
          { valor: "copilot", texto: "Copilot" },
          { valor: "ninguna", texto: "Ninguna", excluyente: true },
        ],
      },
      {
        id: "usos_ia",
        numero: 21.1,
        tipo: "opcionMultiple",
        etiqueta: "¿Para qué la usas?",
        permiteOtro: true,
        visibleSi: { pregunta: "herramientas_ia", incluyeAlgoDistintoDe: ["ninguna"] },
        opciones: [
          { valor: "redactar", texto: "Redactar correos o textos" },
          { valor: "resumir", texto: "Resumir documentos" },
          { valor: "analizar", texto: "Analizar datos" },
          { valor: "buscar", texto: "Buscar información" },
          { valor: "traducir", texto: "Traducir" },
          { valor: "ideas", texto: "Ideas y lluvia de ideas" },
        ],
      },
      {
        id: "nivel_ia",
        numero: 22,
        tipo: "escala",
        etiqueta: "¿Cómo describirías tu nivel?",
        min: 1,
        max: 5,
        etiquetaMin: "Nunca la he usado",
        etiquetaMax: "La uso todos los días para trabajar",
      },
    ],
  },

  /* ─── 6 ──────────────────────────────────────────────────────────────── */
  {
    id: "tecnico",
    titulo: "Técnico",
    encabezado:
      "Estas dos respuestas definen qué podemos construir en clase. Si no estás seguro de alguna, verifícala antes de responder.",
    preguntas: [
      {
        id: "plan_claude",
        numero: 23,
        tipo: "opcionUnica",
        etiqueta: "¿Tu cuenta de Claude Pro está activa y a tu nombre?",
        obligatoria: true,
        opciones: [
          { valor: "activa", texto: "Sí, ya está activa" },
          { valor: "activare", texto: "Aún no, la activo antes de la primera sesión" },
          { valor: "gratuito", texto: "Tengo el plan gratuito" },
          { valor: "no_se", texto: "No sé cuál tengo" },
        ],
      },
      {
        id: "computador",
        numero: 24,
        tipo: "opcionUnica",
        etiqueta: "¿Qué computador vas a usar?",
        obligatoria: true,
        opciones: [
          { valor: "mac_personal", texto: "Mac personal" },
          { valor: "windows_personal", texto: "Windows personal" },
          { valor: "mac_empresa", texto: "Mac de la empresa" },
          { valor: "windows_empresa", texto: "Windows de la empresa" },
        ],
      },
      {
        id: "permisos_instalacion",
        numero: 24.1,
        tipo: "opcionUnica",
        etiqueta: "¿Puedes instalar aplicaciones sin pedir permiso a sistemas?",
        ayudaDestacada:
          "Verifícalo antes de responder. La segunda sesión depende de esto.",
        obligatoria: true,
        visibleSi: { pregunta: "computador", es: ["mac_empresa", "windows_empresa"] },
        opciones: [
          { valor: "si_admin", texto: "Sí, tengo permisos de administrador" },
          { valor: "debo_pedir", texto: "No, tengo que pedirlo" },
          { valor: "no_seguro", texto: "No estoy seguro" },
        ],
      },
    ],
  },

  /* ─── 7 ──────────────────────────────────────────────────────────────── */
  {
    id: "confidencialidad",
    titulo: "Confidencialidad",
    preguntas: [
      {
        id: "restricciones",
        numero: 25,
        tipo: "opcionMultiple",
        etiqueta:
          "¿Qué información no puede salir hacia una herramienta externa por política de tu empresa?",
        permiteOtro: true,
        opciones: [
          { valor: "cifras", texto: "Cifras financieras" },
          { valor: "clientes", texto: "Datos de clientes" },
          { valor: "proveedores", texto: "Datos de proveedores" },
          { valor: "nomina", texto: "Nómina y datos de empleados" },
          { valor: "producto", texto: "Información de producto o fórmulas" },
          { valor: "contratos", texto: "Contratos" },
          { valor: "sin_restriccion", texto: "Ninguna restricción formal", excluyente: true },
          { valor: "no_lo_se", texto: "No lo sé", excluyente: true },
        ],
      },
      {
        id: "decision_datos",
        numero: 26,
        tipo: "opcionUnica",
        etiqueta:
          "¿La decisión de usar información de la empresa en esta capacitación es tuya?",
        opciones: [
          { valor: "es_mia", texto: "Sí, es mía" },
          { valor: "avisar", texto: "Necesito avisar pero no pedir permiso" },
          { valor: "autorizacion", texto: "Necesito autorización de alguien más" },
        ],
      },
    ],
  },

  /* ─── 8 ──────────────────────────────────────────────────────────────── */
  {
    id: "expectativas",
    titulo: "Qué esperas",
    preguntas: [
      {
        id: "vale_la_pena",
        numero: 27,
        tipo: "textoLargo",
        etiqueta:
          'Completa: "Esta capacitación valió la pena si al terminar yo puedo…"',
        obligatoria: true,
        minCaracteres: 40,
        filas: 4,
      },
      {
        id: "perdida_tiempo",
        numero: 28,
        tipo: "textoLargo",
        etiqueta: "¿Qué haría que sintieras que perdiste el tiempo?",
        obligatoria: true,
        minCaracteres: 40,
        filas: 4,
      },
    ],
  },

  /* ─── 9 ──────────────────────────────────────────────────────────────── */
  {
    id: "muestras",
    titulo: "Muestras de tu trabajo",
    opcional: true,
    encabezado:
      "Esta parte es opcional, pero es la que más personaliza las sesiones. Necesito ver cómo escribes y cómo estructuras tu trabajo. Si algo tiene datos sensibles, cámbialos por cifras inventadas: me interesa la estructura y tu forma de escribir, no las cifras. Puedes elegir cómo compartirlo.",
    preguntas: [
      {
        id: "compartir_muestras",
        numero: 29,
        tipo: "opcionUnica",
        etiqueta: "¿Cómo prefieres compartirlo?",
        opciones: [
          { valor: "subir_archivos", texto: "Subir archivos" },
          { valor: "subir_capturas", texto: "Subir capturas de pantalla" },
          { valor: "describir", texto: "Describirlo por escrito" },
          { valor: "no_compartir", texto: "Prefiero no compartir nada por ahora" },
        ],
      },
      {
        id: "archivos",
        numero: 29.1,
        tipo: "archivos",
        etiqueta: "Sube tus archivos",
        visibleSi: {
          pregunta: "compartir_muestras",
          es: ["subir_archivos", "subir_capturas"],
        },
        maxArchivos: 5,
        maxMB: 10,
        formatos: ["pdf", "docx", "xlsx", "pptx", "png", "jpg", "jpeg", "csv", "txt"],
        sugerencias: [
          "Un informe que hayas hecho tú",
          "Un documento donde hayas escrito un proceso o instructivo",
          "Un correo tuyo de trabajo, de los largos",
        ],
      },
      {
        id: "descripcion_informe",
        numero: 29.2,
        tipo: "textoLargo",
        etiqueta: "Descríbelo por escrito",
        ayuda:
          "Describe cómo se ve tu informe principal: qué secciones tiene, en qué orden, qué datos lleva cada una y cómo lo cierras.",
        visibleSi: { pregunta: "compartir_muestras", es: ["describir"] },
        filas: 7,
      },
      {
        id: "nota_no_compartir",
        tipo: "nota",
        etiqueta: "",
        variante: "oliva",
        texto:
          "Sin problema. Si cambias de opinión antes de la sesión, me lo puedes enviar por correo.",
        visibleSi: { pregunta: "compartir_muestras", es: ["no_compartir"] },
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * Banderas
 *
 * Se calculan al guardar el envío y se muestran arriba del todo en el panel.
 * Son las que obligan a rediseñar la clase, por eso llevan `implicacion`:
 * el panel no solo dice qué pasa, dice qué hacer.
 * ═══════════════════════════════════════════════════════════════════════════ */

export const BANDERAS: DefinicionBandera[] = [
  {
    id: "sin_pro",
    etiqueta: "Sin Claude Pro",
    severidad: "alta",
    cuando: { pregunta: "plan_claude", es: ["gratuito", "no_se"] },
    implicacion:
      "Escribirle antes de la sesión 1 para resolver la cuenta. Sin Pro no hay Proyectos ni archivos.",
  },
  {
    id: "sin_permisos",
    etiqueta: "Sin permisos de instalación",
    severidad: "alta",
    cuando: { pregunta: "permisos_instalacion", es: ["debo_pedir", "no_seguro"] },
    implicacion:
      "La sesión 2 no puede depender de instalar nada. Plan B: todo en navegador.",
  },
  {
    id: "sin_exportacion",
    etiqueta: "Sistema sin exportación",
    severidad: "alta",
    cuando: { pregunta: "exportacion", es: ["solo_pantalla", "solo_pdf"] },
    implicacion:
      "No hay CSV que cargar. La sesión 2 se diseña sobre extracción desde PDF o captura manual.",
  },
  {
    id: "expectativa_fuera_de_alcance",
    etiqueta: "Expectativa fuera de alcance",
    severidad: "media",
    cuando: { pregunta: "idea_dashboard", es: ["tablero_en_vivo"] },
    implicacion:
      "Espera integración en vivo. Aclarar el alcance en la sesión 1, antes de que se decepcione en la 3.",
  },
  {
    id: "querra_compartir",
    etiqueta: "Querrá compartirlo con el equipo",
    severidad: "media",
    cuando: { pregunta: "quien_mas_hace", es: ["otra_persona", "varias_personas"] },
    implicacion:
      "Diseñar los entregables para que se puedan pasar a terceros. Posible venta de seguimiento al equipo.",
  },
  {
    id: "restricciones_datos",
    etiqueta: "Restricciones de datos",
    severidad: "media",
    cuando: {
      pregunta: "restricciones",
      incluyeAlgoDistintoDe: ["sin_restriccion", "no_lo_se"],
    },
    implicacion:
      "Preparar ejemplos con datos ficticios. No pedirle que suba información real en clase.",
  },
  {
    id: "sin_muestras",
    etiqueta: "Sin muestras",
    severidad: "baja",
    cuando: { pregunta: "compartir_muestras", es: ["no_compartir"] },
    implicacion:
      "No hay material propio. Pedirle un ejemplo al inicio de la sesión 1 o trabajar con plantillas.",
  },
];
