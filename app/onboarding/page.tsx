import { FormEngine } from "@/components/form/FormEngine";
import { leerBorrador } from "@/lib/db/drafts";
import { VERSION_FORMULARIO } from "@/lib/questions";
import type { Borrador } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * `?r=<token>` retoma un borrador desde cualquier dispositivo. El token es una
 * llave al portador con 30 días de vigencia; se destruye al enviar.
 */
export default async function Onboarding({
  searchParams,
}: {
  searchParams: { r?: string };
}) {
  let borradorInicial: Borrador | null = null;

  const token = searchParams.r;
  if (token) {
    try {
      const fila = await leerBorrador(token);
      if (fila) {
        borradorInicial = {
          version: VERSION_FORMULARIO,
          actualizado: fila.updatedAt.toISOString(),
          seccion: fila.seccion,
          respuestas: fila.datos,
          token: fila.token,
        };
      }
    } catch (error) {
      console.error("[onboarding] no se pudo leer el borrador:", error);
    }
  }

  return <FormEngine borradorInicial={borradorInicial} />;
}
