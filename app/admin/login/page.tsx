"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Boton } from "@/components/ui/Boton";
import { entrar } from "../acciones";

function BotonEntrar() {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" disabled={pending} className="w-full">
      {pending ? "Entrando…" : "Entrar"}
    </Boton>
  );
}

export default function Login() {
  const [error, accion] = useFormState(entrar, null);

  return (
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="titular text-d-md leading-none text-negro">Panel.</h1>
      <p className="mt-3 font-sans text-sm text-oliva">
        Respuestas de onboarding. Solo para Kike.
      </p>

      <form action={accion} className="mt-8">
        <label htmlFor="password" className="mb-2 block font-sans text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          className="w-full min-h-[48px] border-2 border-negro/15 bg-white px-4 py-3 font-sans text-base focus-visible:border-negro"
        />

        {error && (
          <p
            role="alert"
            className="mt-3 border-l-[3px] border-alerta bg-alerta/10 px-3 py-2 font-sans text-sm text-alerta"
          >
            {error}
          </p>
        )}

        <div className="mt-5">
          <BotonEntrar />
        </div>
      </form>
    </div>
  );
}
