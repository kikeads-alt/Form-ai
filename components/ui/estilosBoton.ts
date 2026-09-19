/**
 * Estilos compartidos entre <Boton> (cliente, dispara eventos) y <EnlaceBoton>
 * (puede usarse desde un componente de servidor, navega con <Link>).
 *
 * Vive en un archivo sin "use client" a propósito: un componente de servidor
 * no puede leer un valor exportado desde un módulo cliente, así que si esto
 * viviera dentro de Boton.tsx, <EnlaceBoton> reventaría al usarse en /admin.
 */
export type Variante = "primario" | "secundario" | "texto";

export const ESTILOS_BOTON: Record<Variante, string> = {
  primario:
    "bg-negro text-crema border-2 border-negro hover:bg-carbon disabled:bg-oliva/40 disabled:border-oliva/40 disabled:text-crema",
  secundario:
    "bg-transparent text-negro border-2 border-negro/25 hover:border-negro disabled:opacity-40",
  texto: "bg-transparent text-oliva border-2 border-transparent underline hover:text-negro",
};
