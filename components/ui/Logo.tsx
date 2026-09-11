/**
 * Logotipo de marca. Es texto, nunca imagen.
 * "kike" toma el color del contraste del fondo; "ads_" siempre mostaza.
 */
export function Logo({
  sobre = "crema",
  tamano = "base",
}: {
  sobre?: "crema" | "negro";
  tamano?: "base" | "grande";
}) {
  return (
    <span
      className={`titular leading-none tracking-wide ${
        tamano === "grande" ? "text-d-sm" : "text-2xl"
      }`}
    >
      <span className={sobre === "negro" ? "text-crema" : "text-negro"}>kike</span>
      <span className="text-mostaza">ads_</span>
    </span>
  );
}
