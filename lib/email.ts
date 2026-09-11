import { Resend } from "resend";

import type { BanderaActiva } from "./types";

/**
 * Notificación de envío completado.
 *
 * Degrada en silencio: si falta RESEND_API_KEY, o si Resend responde error, se
 * registra en consola y ya. Un fallo de correo nunca puede tumbar un envío que
 * la persona ya completó.
 */
export async function notificarEnvio(entrada: {
  id: string;
  nombre: string;
  empresa: string;
  cargo: string;
  correo: string;
  banderas: BanderaActiva[];
  urlBase: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.EMAIL_TO ?? "info@kikeads.com";
  const remitente = process.env.EMAIL_FROM;

  const enlace = `${entrada.urlBase.replace(/\/$/, "")}/admin/${entrada.id}`;
  const asunto = `Onboarding completado — ${entrada.nombre} (${entrada.empresa})`;

  if (!apiKey || !remitente) {
    console.info(
      `[correo] Resend no configurado. Envío recibido: ${asunto}\n` +
        `         Banderas: ${entrada.banderas.map((b) => b.id).join(", ") || "ninguna"}\n` +
        `         Detalle: ${enlace}`,
    );
    return;
  }

  const filasBanderas =
    entrada.banderas.length === 0
      ? '<p style="margin:0 0 4px;color:#556B57;">Sin banderas.</p>'
      : entrada.banderas
          .map(
            (b) =>
              `<p style="margin:0 0 10px;"><strong style="color:#0D0D0D;">${b.etiqueta}</strong>` +
              ` <span style="color:#556B57;">(${b.severidad})</span><br>` +
              `<span style="color:#556B57;">${b.implicacion}</span></p>`,
          )
          .join("");

  const html = `
<div style="font-family:system-ui,-apple-system,sans-serif;background:#F4F1EA;padding:32px;color:#0D0D0D;">
  <p style="margin:0 0 24px;font-size:20px;letter-spacing:0.04em;">
    <span style="color:#0D0D0D;">kike</span><span style="color:#D6A52C;">ads_</span>
  </p>
  <h1 style="margin:0 0 20px;font-size:22px;line-height:1.2;">Onboarding completado</h1>
  <p style="margin:0 0 6px;"><strong>${entrada.nombre}</strong></p>
  <p style="margin:0 0 2px;color:#556B57;">${entrada.cargo}</p>
  <p style="margin:0 0 2px;color:#556B57;">${entrada.empresa}</p>
  <p style="margin:0 0 24px;color:#556B57;">${entrada.correo}</p>
  <div style="border-left:3px solid #D6A52C;padding:12px 16px;background:rgba(214,165,44,0.1);margin-bottom:24px;">
    ${filasBanderas}
  </div>
  <a href="${enlace}" style="display:inline-block;background:#0D0D0D;color:#F4F1EA;padding:14px 24px;text-decoration:none;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">
    Ver el detalle
  </a>
</div>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: remitente,
      to: destino,
      replyTo: entrada.correo,
      subject: asunto,
      html,
    });

    if (error) {
      console.error("[correo] Resend devolvió error:", error);
    }
  } catch (error) {
    console.error("[correo] no se pudo enviar la notificación:", error);
  }
}
