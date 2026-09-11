"use client";

import { useRef, useState } from "react";

import type { ArchivoSubido, PreguntaArchivos } from "@/lib/types";

import type { PropsControl } from "../tipos";
import { Campo } from "./Campo";

interface EnCurso {
  id: string;
  nombre: string;
  progreso: number;
  error?: string;
}

function pesoLegible(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extension(nombre: string): string {
  return nombre.split(".").pop()?.toLowerCase() ?? "";
}

export function Archivos({
  pregunta,
  respuestas,
  errores,
  onChange,
}: PropsControl<PreguntaArchivos>) {
  const subidos = Array.isArray(respuestas[pregunta.id])
    ? (respuestas[pregunta.id] as ArchivoSubido[])
    : [];

  const [enCurso, setEnCurso] = useState<EnCurso[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cupo = pregunta.maxArchivos - subidos.length - enCurso.length;

  function rechazar(archivo: File): string | null {
    if (!pregunta.formatos.includes(extension(archivo.name))) {
      return `Formato no admitido. Se aceptan: ${pregunta.formatos.join(", ")}.`;
    }
    if (archivo.size > pregunta.maxMB * 1024 * 1024) {
      return `Pesa ${pesoLegible(archivo.size)}. El máximo es ${pregunta.maxMB} MB.`;
    }
    return null;
  }

  async function subir(archivo: File) {
    const id = `${archivo.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const motivo = rechazar(archivo);

    if (motivo) {
      setEnCurso((previo) => [...previo, { id, nombre: archivo.name, progreso: 0, error: motivo }]);
      return;
    }

    setEnCurso((previo) => [...previo, { id, nombre: archivo.name, progreso: 0 }]);

    try {
      const { subirArchivo } = await import("@/lib/upload-cliente");
      const resultado = await subirArchivo(archivo, (progreso) => {
        setEnCurso((previo) => previo.map((e) => (e.id === id ? { ...e, progreso } : e)));
      });

      onChange(pregunta.id, [
        ...(Array.isArray(respuestas[pregunta.id])
          ? (respuestas[pregunta.id] as ArchivoSubido[])
          : []),
        resultado,
      ]);
      setEnCurso((previo) => previo.filter((e) => e.id !== id));
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "No se pudo subir. Inténtalo otra vez.";
      setEnCurso((previo) =>
        previo.map((e) => (e.id === id ? { ...e, error: mensaje } : e)),
      );
    }
  }

  function recibir(lista: FileList | null) {
    if (!lista) return;
    Array.from(lista).slice(0, Math.max(cupo, 0)).forEach(subir);
  }

  function quitar(url: string) {
    onChange(
      pregunta.id,
      subidos.filter((a) => a.url !== url),
    );
  }

  return (
    <Campo pregunta={pregunta} error={errores[pregunta.id]}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          recibir(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed px-5 py-8 text-center transition-colors ${
          arrastrando ? "border-mostaza bg-mostaza/10" : "border-negro/25 bg-white"
        }`}
      >
        <p className="font-sans text-[15px] text-negro">
          Arrastra tus archivos aquí
        </p>
        <p className="mt-1 font-sans text-sm text-oliva">
          Hasta {pregunta.maxArchivos} archivos, {pregunta.maxMB} MB cada uno
        </p>

        <button
          type="button"
          disabled={cupo <= 0}
          onClick={() => inputRef.current?.click()}
          className="mt-4 min-h-[44px] border-2 border-negro bg-transparent px-5 font-sans text-sm font-semibold uppercase tracking-[0.08em] text-negro transition-colors hover:bg-negro hover:text-crema disabled:cursor-not-allowed disabled:opacity-40"
        >
          {cupo > 0 ? "Elegir archivos" : "Llegaste al máximo"}
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={pregunta.formatos.map((f) => `.${f}`).join(",")}
          onChange={(e) => {
            recibir(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
          aria-label="Elegir archivos"
        />
      </div>

      {pregunta.sugerencias && (
        <ul className="lista-kike mt-4 flex flex-col gap-1.5 font-sans text-sm text-oliva">
          {pregunta.sugerencias.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}

      {(subidos.length > 0 || enCurso.length > 0) && (
        <ul className="mt-4 flex flex-col gap-2">
          {subidos.map((archivo) => (
            <li
              key={archivo.url}
              className="flex items-center justify-between gap-3 border-2 border-negro/15 bg-white px-4 py-3"
            >
              <span className="min-w-0">
                <span className="block truncate font-sans text-sm text-negro">
                  {archivo.nombre}
                </span>
                <span className="font-sans text-xs text-oliva">
                  {pesoLegible(archivo.tamano)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => quitar(archivo.url)}
                className="shrink-0 font-sans text-xs uppercase tracking-[0.1em] text-oliva underline hover:text-alerta"
              >
                Quitar
              </button>
            </li>
          ))}

          {enCurso.map((entrada) => (
            <li
              key={entrada.id}
              className={`border-2 px-4 py-3 ${
                entrada.error ? "border-alerta bg-alerta/5" : "border-negro/15 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate font-sans text-sm text-negro">
                  {entrada.nombre}
                </span>
                {entrada.error ? (
                  <button
                    type="button"
                    onClick={() =>
                      setEnCurso((previo) => previo.filter((e) => e.id !== entrada.id))
                    }
                    className="shrink-0 font-sans text-xs uppercase tracking-[0.1em] text-oliva underline"
                  >
                    Descartar
                  </button>
                ) : (
                  <span className="shrink-0 font-sans text-xs tabular-nums text-oliva">
                    {entrada.progreso}%
                  </span>
                )}
              </div>

              {entrada.error ? (
                <p role="alert" className="mt-1 font-sans text-sm text-alerta">
                  {entrada.error}
                </p>
              ) : (
                <div className="mt-2 h-1 w-full bg-negro/10">
                  <div
                    className="h-full bg-mostaza transition-[width] duration-200"
                    style={{ width: `${entrada.progreso}%` }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Campo>
  );
}
