"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { COOKIE, haySesion, passwordCorrecta, valorDeSesion } from "@/lib/auth";
import { cambiarEstado } from "@/lib/db/submissions";
import type { EstadoEnvio } from "@/lib/types";

export async function entrar(_previo: string | null, datos: FormData): Promise<string | null> {
  const intento = String(datos.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD) {
    return "El panel no tiene contraseña configurada. Falta ADMIN_PASSWORD.";
  }

  if (!passwordCorrecta(intento)) {
    // Retardo fijo: no revela nada por tiempo y frena el ensayo a mano.
    await new Promise((r) => setTimeout(r, 600));
    return "Contraseña incorrecta.";
  }

  cookies().set(COOKIE.nombre, valorDeSesion(), COOKIE.opciones);
  redirect("/admin");
}

export async function salir(): Promise<void> {
  cookies().delete(COOKIE.nombre);
  redirect("/admin/login");
}

export async function actualizarEstado(id: string, estado: EstadoEnvio): Promise<void> {
  if (!haySesion()) redirect("/admin/login");

  await cambiarEstado(id, estado);
  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
}
