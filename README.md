# Onboarding · kikeads_

Formulario de onboarding para las sesiones de capacitación 1:1. Lo llena cada
participante días antes de la primera clase, y sus respuestas son el insumo con
el que se diseñan las sesiones.

- `/onboarding` — formulario público, 9 secciones, una pantalla cada una
- `/admin` — panel privado con las respuestas, las banderas y los botones de copiado

Next.js 14 (App Router) · TypeScript · Tailwind · Postgres con Drizzle ·
Vercel Blob · Resend.

---

## Arrancar en local

```bash
npm install
cp .env.example .env.local     # ver "Variables de entorno" más abajo
npm run db:migrate             # crea las tablas
npm run dev                    # http://localhost:3000
```

**La app arranca sin configurar nada.** Cada pieza que falte se apaga sola:

| Falta | Qué deja de funcionar | Qué sigue funcionando |
|---|---|---|
| `DATABASE_URL` | Guardar envíos, el panel, los borradores en servidor | Recorrer y llenar el formulario entero, con guardado en el navegador |
| `ADMIN_PASSWORD` | Entrar a `/admin` | Todo lo demás |
| `BLOB_READ_WRITE_TOKEN` | Subir archivos en la sección 9 | El resto del formulario, incluido enviarlo |
| `RESEND_API_KEY` | El correo de aviso (se escribe en los logs) | Todo. Un fallo de correo nunca tumba un envío |

Esto es a propósito: permite trabajar en el diseño sin levantar infraestructura,
y evita que un servicio caído impida que alguien complete el formulario.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo |
| `npm run build` | Compilación de producción |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint` | ESLint |
| `npm run db:generate` | Genera una migración desde `lib/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:studio` | Explorador visual de la base de datos |

---

## Cómo agregar o modificar preguntas

**Todo el contenido del formulario vive en `lib/questions.ts`.** Ningún
componente conoce una pregunta concreta: el motor solo sabe interpretar los
tipos definidos en `lib/types.ts`. Agregar, quitar o reordenar preguntas es
editar ese archivo y nada más.

### Las dos reglas que evitan romper los envíos guardados

1. **El `id` de una pregunta y el `valor` de una opción son claves de base de
   datos.** Se pueden reordenar y renumerar libremente, pero renombrarlos deja
   huérfanas las respuestas anteriores. Por eso los ids son semánticos
   (`plan_claude`) y no posicionales (`p23`): si la pregunta se mueve de la
   sección 6 a la 3, el `numero` cambia y el `id` no.
2. **La `etiqueta` de una pregunta y el `texto` de una opción son presentación.**
   Cambiarlos es seguro y no requiere migración.

Cuando hagas un cambio que sí rompa compatibilidad — renombrar ids, eliminar
opciones que alguien ya eligió — sube `VERSION_FORMULARIO`. Cada envío guarda
con qué versión se respondió, y el panel lo muestra.

> Las respuestas cuya pregunta ya no existe en el esquema no se pierden: el
> panel y el botón de copiado las imprimen aparte, bajo "Respuestas de una
> versión anterior del formulario".

### Agregar una pregunta

Se añade un objeto al arreglo `preguntas` de la sección correspondiente:

```ts
{
  id: "presupuesto_anual",        // clave en la base. No la cambies después.
  numero: 30,                      // solo presentación
  tipo: "opcionUnica",
  etiqueta: "¿Manejas presupuesto propio?",
  ayuda: "El de tu área, no el de la empresa.",
  obligatoria: true,
  opciones: [
    { valor: "si", texto: "Sí, lo decido yo" },
    { valor: "propongo", texto: "Lo propongo, lo aprueba alguien más" },
    { valor: "no", texto: "No manejo presupuesto" },
  ],
},
```

Eso es todo. El control se renderiza, entra en la validación, aparece en el
panel y sale en los dos botones de copiado, sin tocar ningún otro archivo.

### Tipos de pregunta disponibles

| `tipo` | Para qué | Campos propios |
|---|---|---|
| `texto` · `email` | Una línea | `placeholder`, `maxCaracteres` |
| `textoLargo` | Párrafos, con contador | `minCaracteres`, `filas` |
| `opcionUnica` | Elegir una | `opciones`, `permiteOtro` |
| `opcionMultiple` | Elegir varias | `opciones`, `permiteOtro`, `minSelecciones` |
| `escala` | 1 a 5 con extremos rotulados | `min`, `max`, `etiquetaMin`, `etiquetaMax` |
| `derivadaSelect` | Desplegables alimentados por otra pregunta | `desde`, `cantidad`, `sinRepetir` |
| `derivadaTextoLargo` | Un campo por cada elemento elegido antes | `desde`, `minCaracteres` |
| `cuadricula` | Filas derivadas × grupos de opciones | `filasDesde`, `grupos` |
| `archivos` | Subida a Blob | `maxArchivos`, `maxMB`, `formatos`, `sugerencias` |
| `nota` | Bloque de texto sin campo | `texto`, `variante` |

Para un tipo nuevo hay que tocar dos sitios además de `lib/types.ts`: crear el
control en `components/form/controls/` y añadir su caso en
`components/form/QuestionRenderer.tsx`. Debería pasar casi nunca.

### Agregar una pregunta condicional

Las condiciones son datos, no código. Se declaran con `visibleSi`:

```ts
// Aparece si eligió una opción concreta
visibleSi: { pregunta: "computador", es: ["mac_empresa", "windows_empresa"] }

// Aparece si marcó alguna opción distinta de "Ninguno"
visibleSi: { pregunta: "sistemas_internos", incluyeAlgoDistintoDe: ["ninguno"] }

// Aparece si marcó alguna de estas
visibleSi: { pregunta: "restricciones", incluye: ["cifras", "nomina"] }

// Combinaciones
visibleSi: { todas: [
  { pregunta: "computador", es: ["windows_empresa"] },
  { pregunta: "personas_dependen", es: ["mas_10"] },
]}
```

Operadores: `es`, `incluye`, `incluyeAlgoDistintoDe`, `respondida`, y los
combinadores `todas`, `alguna`, `no`.

Una pregunta oculta no se valida ni se guarda. Si alguien responde y luego
cambia de opción, su respuesta se queda en memoria por si vuelve atrás, pero no
llega al envío ni dispara banderas.

### Preguntas que se alimentan de otras

Las tres del bloque de tareas funcionan así:

```
tareas_repetitivas (opcionMultiple)
        ↓ desde
tres_tareas (derivadaSelect)      → desplegables con lo que marcó, sin repetir
        ↓ desde / filasDesde
detalle_tareas (derivadaTextoLargo)   → un campo por tarea, con su nombre real
frecuencia_tiempo (cuadricula)        → una tarjeta por tarea
```

Si alguien desmarca en la primera una tarea que ya había elegido en la segunda,
se poda todo lo que dependía de ella (`sanearRespuestas` en `lib/derived.ts`).
Si marca menos de tres tareas, se muestran menos desplegables.

### Agregar una bandera

Al final de `lib/questions.ts`, en `BANDERAS`. Usan el mismo evaluador que los
condicionales:

```ts
{
  id: "sin_presupuesto",
  etiqueta: "Sin presupuesto propio",
  severidad: "media",                          // alta · media · baja
  cuando: { pregunta: "presupuesto_anual", es: ["no"] },
  implicacion: "No puede comprar herramientas. Diseñar todo con lo que ya tiene.",
},
```

`implicacion` es lo que se lee en el panel debajo del nombre de la bandera: no
dice solo qué pasa, dice qué hacer. Se guarda resuelta dentro del envío, así que
un envío de hace seis meses se sigue leyendo aunque hoy reescribas o elimines
esa bandera del catálogo.

### Cambiar textos de las pantallas de apertura y cierre

`BIENVENIDA` y `CIERRE`, arriba del todo en `lib/questions.ts`.

### Partir o reordenar secciones

Las secciones son el arreglo `SECCIONES`. Mover un bloque de preguntas a una
sección nueva es cortar y pegar: la barra de progreso cuenta las secciones sola,
así que "Sección 3 de 9" pasa a "de 10" sin tocar nada más.

---

## Sistema visual

Los colores, la escala tipográfica y las restricciones de marca están en
`tailwind.config.ts` y en las variables de `app/globals.css`. Cambiar el sistema
visual entero es editar esos dos archivos.

Dos reglas de marca están codificadas como restricciones, no como convención:
el radio máximo es 4px y las sombras están deshabilitadas como utilidades, así
que `rounded-xl` y `shadow-lg` no existen.

**Sobre el mostaza.** `#D6A52C` sobre crema da 2.0:1 de contraste y no cumple el
mínimo AA para texto. Por eso el acento va en bordes, fondos al 10% y estados
seleccionados, nunca como color de texto sobre crema. Sobre negro sí funciona
(8.6:1): de ahí el `ads_` de la cabecera. El anillo de foco lleva dos capas —
negro pegado al borde, mostaza por fuera — para que se lea como foco mostaza y
cumpla el contraste.

---

## Desplegar en Vercel

1. **Importar el repositorio.** En Vercel → *Add New* → *Project* → elegir este
   repositorio. Next.js se detecta solo; no hay que tocar la configuración de
   compilación.

2. **Crear la base de datos.** Vercel → *Storage* → *Create Database* →
   *Neon (Serverless Postgres)* → conectarla a este proyecto. `DATABASE_URL`
   queda inyectada sola.

   Si prefieres Neon por fuera de Vercel, copia la cadena de conexión **en modo
   pooled** y pégala a mano como variable de entorno.

3. **Poner las variables.** *Settings* → *Environment Variables*. Como mínimo
   `ADMIN_PASSWORD`. El resto está documentado en `.env.example`.

4. **Crear las tablas.** Con `DATABASE_URL` a mano, desde tu equipo:

   ```bash
   DATABASE_URL="la-cadena-de-produccion" npm run db:migrate
   ```

5. **Archivos (opcional).** *Storage* → *Create Blob store* → conectarlo al
   proyecto. `BLOB_READ_WRITE_TOKEN` se inyecta sola.

6. **Correo (opcional).** En Resend, verificar el dominio `kikeads.com` con los
   registros DNS que indica el panel. Después, poner `RESEND_API_KEY` y
   `EMAIL_FROM` con una dirección de ese dominio.

7. **Volver a desplegar** después de añadir variables: Vercel no las aplica a un
   despliegue que ya existe.

Cada `git push` a la rama principal despliega a producción. Los push a otras
ramas generan una vista previa con su propia URL.

---

## Modelo de datos

```
submissions          envíos completados
  id, created_at, nombre, correo, cargo, empresa
  respuestas   jsonb   todas las respuestas, con la clave de cada pregunta
  archivos     jsonb   [{ nombre, url, tipo, tamano }]
  banderas     jsonb   [{ id, etiqueta, severidad, implicacion }]
  estado               nueva · revisada · procesada
  version_formulario

drafts               borradores en curso, se borran al enviar
  token, correo, datos, seccion, created_at, updated_at, expira_en
```

Las respuestas van en `jsonb` y no en una columna por pregunta, precisamente
para que cambiar el cuestionario no implique migrar la base.

Los borradores viven en su propia tabla a propósito: un formulario a medias no
es un envío y no debe ensuciar el panel. Caducan a los 30 días y se limpian
solos.

---

## Cómo se guarda el avance

1. **En el navegador**, en cada cambio, con aviso discreto de "Guardado".
2. **En el servidor**, en cuanto hay un correo válido. Genera un token de 24
   bytes aleatorios con el que se puede retomar desde otro dispositivo:
   `/onboarding?r=<token>`.

El token es una llave al portador: quien lo tenga ve lo que esa persona
escribió. Por eso caduca a los 30 días y se destruye al enviar el formulario.

---

## Decisiones que conviene conocer

**La subida de archivos no pasa por la API.** El cuerpo de una función
serverless en Vercel está topado en 4.5 MB y el formulario admite archivos de
10 MB. `/api/upload` solo firma el permiso; los bytes van directos del navegador
a Blob.

**Vercel Blob solo ofrece almacenamiento público.** Las rutas llevan sufijo
aleatorio y son imposibles de adivinar, pero quien tenga la URL abre el archivo.
Con documentos internos de clientes conviene tenerlo presente y borrar los
archivos al pasar el envío a *procesada*.

**La validación se repite en el servidor.** El mismo esquema y el mismo motor,
sin confiar en lo que mande el navegador.

**El panel no tiene usuarios.** Una contraseña en variable de entorno y una
cookie firmada con HMAC. La contraseña nunca viaja dentro de la cookie y la
comparación es en tiempo constante.
