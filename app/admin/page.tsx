import Link from "next/link";
import { redirect } from "next/navigation";

import { BanderaEtiqueta } from "@/components/admin/BanderaEtiqueta";
import { Boton } from "@/components/ui/Boton";
import { haySesion } from "@/lib/auth";
import { hayBaseDeDatos } from "@/lib/db";
import { listarEnvios } from "@/lib/db/submissions";

import { salir } from "./acciones";

export const dynamic = "force-dynamic";

const FECHA = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

const ESTILO_ESTADO: Record<string, string> = {
  nueva: "border-negro bg-negro text-crema",
  revisada: "border-negro/30 bg-transparent text-negro",
  procesada: "border-oliva/40 bg-transparent text-oliva",
};

export default async function Panel() {
  if (!haySesion()) redirect("/admin/login");

  if (!hayBaseDeDatos) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="titular text-d-md leading-none">Panel.</h1>
        <p className="mt-4 border-l-[3px] border-alerta bg-alerta/10 px-4 py-3 font-sans text-sm text-alerta">
          Falta <code>DATABASE_URL</code>. Sin base de datos no hay envíos que mostrar.
        </p>
      </div>
    );
  }

  const envios = await listarEnvios();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-mostaza">
            {envios.length} {envios.length === 1 ? "envío" : "envíos"}
          </p>
          <h1 className="titular mt-1 text-d-md leading-none">Onboarding.</h1>
        </div>

        <form action={salir}>
          <Boton variante="secundario" type="submit" className="min-h-[44px] px-4 py-2 text-xs">
            Salir
          </Boton>
        </form>
      </div>

      {envios.length === 0 ? (
        <p className="mt-10 border-l-[3px] border-oliva bg-oliva/10 px-4 py-3 font-sans text-sm text-oliva">
          Todavía no ha llegado ningún envío.
        </p>
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {envios.map((envio) => (
            <li key={envio.id}>
              <Link
                href={`/admin/${envio.id}`}
                className="block border-2 border-negro/15 bg-white p-4 transition-colors hover:border-negro"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-sans text-[17px] font-medium text-negro">{envio.nombre}</p>
                  <span
                    className={`border px-2 py-0.5 font-sans text-[11px] uppercase tracking-[0.08em] ${
                      ESTILO_ESTADO[envio.estado] ?? ESTILO_ESTADO.revisada
                    }`}
                  >
                    {envio.estado}
                  </span>
                </div>

                <p className="mt-0.5 font-sans text-sm text-oliva">
                  {envio.empresa} · {FECHA.format(envio.createdAt)}
                </p>

                {envio.banderas.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {envio.banderas.map((bandera) => (
                      <BanderaEtiqueta key={bandera.id} bandera={bandera} />
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
