import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BanderaDetalle } from "@/components/admin/BanderaEtiqueta";
import { CopiarTexto } from "@/components/admin/CopiarTexto";
import { SelectorEstado } from "@/components/admin/SelectorEstado";
import { haySesion } from "@/lib/auth";
import { leerEnvio } from "@/lib/db/submissions";
import { markdownBrief, markdownRespuestas, valorLegible } from "@/lib/markdown";
import { SECCIONES } from "@/lib/questions";

export const dynamic = "force-dynamic";

const FECHA = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeStyle: "short",
});

function pesoLegible(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function Detalle({ params }: { params: { id: string } }) {
  if (!haySesion()) redirect("/admin/login");

  const envio = await leerEnvio(params.id);
  if (!envio) notFound();

  const paraTexto = { ...envio, versionFormulario: envio.versionFormulario };

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/admin"
        className="font-sans text-xs uppercase tracking-[0.1em] text-oliva underline hover:text-negro"
      >
        ← Todos los envíos
      </Link>

      <h1 className="titular mt-4 text-d-md leading-none">{envio.nombre}</h1>
      <p className="mt-2 font-sans text-[15px] text-carbon">
        {envio.cargo} · {envio.empresa}
      </p>
      <p className="font-sans text-sm text-oliva">
        <a href={`mailto:${envio.correo}`} className="underline hover:text-negro">
          {envio.correo}
        </a>
      </p>
      <p className="mt-1 font-sans text-xs text-oliva">
        Recibido el {FECHA.format(envio.createdAt)} · versión {envio.versionFormulario}
      </p>

      {/* Lo primero que se ve: lo que obliga a rediseñar la clase. */}
      {envio.banderas.length > 0 && (
        <div className="mt-8 flex flex-col gap-2">
          {envio.banderas.map((bandera) => (
            <BanderaDetalle key={bandera.id} bandera={bandera} />
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-negro/10 py-4">
        <CopiarTexto
          destacado
          etiqueta="Copiar brief de clase"
          texto={markdownBrief(paraTexto)}
        />
        <CopiarTexto etiqueta="Copiar respuestas" texto={markdownRespuestas(paraTexto)} />
        <div className="ml-auto">
          <SelectorEstado id={envio.id} estado={envio.estado} />
        </div>
      </div>

      {envio.archivos.length > 0 && (
        <section className="mt-10">
          <h2 className="titular text-d-sm leading-none">Archivos.</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {envio.archivos.map((archivo) => (
              <li key={archivo.url}>
                <a
                  href={archivo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 border-2 border-negro/15 bg-white px-4 py-3 transition-colors hover:border-negro"
                >
                  <span className="min-w-0 truncate font-sans text-sm text-negro">
                    {archivo.nombre}
                  </span>
                  <span className="shrink-0 font-sans text-xs text-oliva">
                    {pesoLegible(archivo.tamano)} · descargar
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {SECCIONES.map((seccion) => {
        const preguntas = seccion.preguntas.filter(
          (p) => p.tipo !== "nota" && envio.respuestas[p.id] !== undefined,
        );
        if (preguntas.length === 0) return null;

        return (
          <section key={seccion.id} className="mt-12">
            <h2 className="titular text-d-sm leading-none">{seccion.titulo}.</h2>

            <dl className="mt-5 flex flex-col gap-6">
              {preguntas.map((pregunta) => (
                  <div key={pregunta.id}>
                    <dt className="font-sans text-sm font-medium text-oliva">
                      {pregunta.etiqueta}
                    </dt>
                    <dd className="mt-1 whitespace-pre-line border-l-[3px] border-negro/15 pl-4 font-sans text-[15px] leading-relaxed text-negro">
                      {valorLegible(pregunta, envio.respuestas)}
                    </dd>
                  </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
