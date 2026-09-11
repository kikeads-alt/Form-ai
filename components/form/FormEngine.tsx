"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BarraProgreso } from "@/components/ui/BarraProgreso";
import { Boton } from "@/components/ui/Boton";
import { sanearRespuestas } from "@/lib/derived";
import { identidadDe, respuestasParaEnviar } from "@/lib/payload";
import { SECCIONES } from "@/lib/questions";
import { borrarLocal, guardarLocal, leerLocal, type Borrador } from "@/lib/storage";
import type { Respuestas, ValorRespuesta } from "@/lib/types";
import {
  hayErrores,
  primerIdConError,
  validarSeccion,
  type Errores,
} from "@/lib/validation";

import { Bienvenida } from "./Bienvenida";
import { SectionRenderer } from "./SectionRenderer";

type Paso = "bienvenida" | number;

export function FormEngine({ borradorInicial }: { borradorInicial?: Borrador | null }) {
  const router = useRouter();

  const [paso, setPaso] = useState<Paso>("bienvenida");
  const [respuestas, setRespuestas] = useState<Respuestas>(
    borradorInicial?.respuestas ?? {},
  );
  const [errores, setErrores] = useState<Errores>({});
  const [borradorPrevio, setBorradorPrevio] = useState<Borrador | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const tokenBorrador = useRef<string | undefined>(borradorInicial?.token);
  const yaHidratado = useRef(false);

  /* ── Retomar ────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (yaHidratado.current) return;
    yaHidratado.current = true;

    // Un enlace de reanudar manda sobre lo que haya en este navegador.
    if (borradorInicial) {
      setPaso(borradorInicial.seccion);
      return;
    }

    const local = leerLocal();
    if (local && Object.keys(local.respuestas).length > 0) {
      setBorradorPrevio(local);
    }
  }, [borradorInicial]);

  /* ── Autoguardado ───────────────────────────────────────────────────── */

  useEffect(() => {
    if (paso === "bienvenida") return;

    const t = setTimeout(() => {
      guardarLocal({ seccion: paso, respuestas, token: tokenBorrador.current });
      setGuardado(true);
    }, 500);

    return () => clearTimeout(t);
  }, [respuestas, paso]);

  useEffect(() => {
    if (!guardado) return;
    const t = setTimeout(() => setGuardado(false), 2200);
    return () => clearTimeout(t);
  }, [guardado]);

  /* ── Borrador en servidor ───────────────────────────────────────────── */

  const sincronizarServidor = useCallback(
    async (seccion: number, datos: Respuestas) => {
      const correo = identidadDe(datos).correo;
      if (!correo) return;

      try {
        const respuesta = await fetch("/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: tokenBorrador.current,
            correo,
            seccion,
            datos,
          }),
        });
        if (!respuesta.ok) return;

        const cuerpo = (await respuesta.json()) as { token?: string };
        if (cuerpo.token) {
          tokenBorrador.current = cuerpo.token;
          guardarLocal({ seccion, respuestas: datos, token: cuerpo.token });
        }
      } catch {
        // Sin base de datos configurada el formulario sigue funcionando
        // con el guardado local. No se le dice nada al participante.
      }
    },
    [],
  );

  /* ── Cambios ────────────────────────────────────────────────────────── */

  function cambiar(id: string, valor: ValorRespuesta) {
    setRespuestas((previo) => sanearRespuestas({ ...previo, [id]: valor }));
    setErrores((previo) => {
      if (!previo[id] && !Object.keys(previo).some((k) => k.startsWith(`${id}::`))) {
        return previo;
      }
      const siguiente = { ...previo };
      delete siguiente[id];
      for (const clave of Object.keys(siguiente)) {
        if (clave.startsWith(`${id}::`)) delete siguiente[clave];
      }
      return siguiente;
    });
  }

  /* ── Navegación ─────────────────────────────────────────────────────── */

  function irArriba() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function enfocarError(nuevos: Errores) {
    const id = primerIdConError(nuevos);
    if (!id) return;
    const nodo = document.getElementById(`campo-${id}`);
    nodo?.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = nodo?.querySelector<HTMLElement>(
      "input:not([type=hidden]), textarea, select, button",
    );
    focusable?.focus({ preventScroll: true });
  }

  function siguiente() {
    if (typeof paso !== "number") return;

    const nuevos = validarSeccion(SECCIONES[paso], respuestas);
    setErrores(nuevos);

    if (hayErrores(nuevos)) {
      enfocarError(nuevos);
      return;
    }

    if (paso === SECCIONES.length - 1) {
      void enviar();
      return;
    }

    void sincronizarServidor(paso + 1, respuestas);
    setPaso(paso + 1);
    irArriba();
  }

  function atras() {
    if (typeof paso !== "number") return;
    setErrores({});
    if (paso === 0) {
      setPaso("bienvenida");
    } else {
      setPaso(paso - 1);
    }
    irArriba();
  }

  /* ── Envío ──────────────────────────────────────────────────────────── */

  async function enviar() {
    setEnviando(true);
    setErrorEnvio(null);

    try {
      const respuesta = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // El servidor recalcula identidad, archivos y banderas desde aquí:
        // no se confía en nada que venga ya digerido por el navegador.
        body: JSON.stringify({
          token: tokenBorrador.current,
          respuestas: respuestasParaEnviar(respuestas),
        }),
      });

      if (!respuesta.ok) {
        const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string } | null;
        throw new Error(cuerpo?.error ?? "No se pudo enviar.");
      }

      borrarLocal();
      router.push("/onboarding/gracias");
    } catch (error) {
      setErrorEnvio(
        error instanceof Error
          ? error.message
          : "No se pudo enviar. Revisa tu conexión e inténtalo otra vez.",
      );
      setEnviando(false);
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────── */

  if (paso === "bienvenida") {
    return (
      <Bienvenida
        borradorPrevio={borradorPrevio}
        onEmpezar={() => {
          borrarLocal();
          setRespuestas({});
          setBorradorPrevio(null);
          setPaso(0);
          irArriba();
        }}
        onRetomar={() => {
          if (borradorPrevio) {
            setRespuestas(borradorPrevio.respuestas);
            tokenBorrador.current = borradorPrevio.token;
            setPaso(Math.min(borradorPrevio.seccion, SECCIONES.length - 1));
          }
          irArriba();
        }}
      />
    );
  }

  const seccion = SECCIONES[paso];
  const esUltima = paso === SECCIONES.length - 1;

  return (
    <div>
      <div className="sticky top-0 z-10">
        <BarraProgreso actual={paso + 1} total={SECCIONES.length} />
      </div>

      <div className="mx-auto max-w-lectura px-5 py-10">
        <SectionRenderer
          seccion={seccion}
          indice={paso}
          respuestas={respuestas}
          errores={errores}
          onChange={cambiar}
        />

        {hayErrores(errores) && (
          <p role="status" className="mt-8 font-sans text-sm text-alerta">
            Falta completar {Object.keys(errores).length}{" "}
            {Object.keys(errores).length === 1 ? "respuesta" : "respuestas"} en esta pantalla.
          </p>
        )}

        {errorEnvio && (
          <p
            role="alert"
            className="mt-8 border-l-[3px] border-alerta bg-alerta/10 px-4 py-3 font-sans text-sm text-alerta"
          >
            {errorEnvio}
          </p>
        )}

        <div className="mt-10 border-t border-negro/10 pt-4">
          <p
            aria-live="polite"
            className={`mb-3 text-right font-sans text-xs text-oliva transition-opacity duration-300 ${
              guardado ? "opacity-100" : "opacity-0"
            }`}
          >
            Guardado
          </p>

          {/* En móvil la acción principal va arriba y a todo el ancho: es la que
              se toca con el pulgar. En escritorio vuelven a fila. */}
          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-between">
            <Boton onClick={siguiente} disabled={enviando} className="w-full sm:w-auto">
              {enviando ? "Enviando…" : esUltima ? "Enviar" : "Siguiente"}
            </Boton>

            <Boton
              variante="secundario"
              onClick={atras}
              disabled={enviando}
              className="w-full sm:w-auto"
            >
              Atrás
            </Boton>
          </div>
        </div>

      </div>
    </div>
  );
}
