import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Acceso al panel.
 *
 * Una contraseña en variable de entorno y una cookie firmada. No hay usuarios
 * porque no hacen falta: solo entra Kike. Lo que sí importa es que la
 * contraseña nunca viaja dentro de la cookie, que la firma no se puede
 * falsificar sin el secreto, y que la comparación es en tiempo constante.
 */
const NOMBRE_COOKIE = "kikeads_admin";
const DIAS = 7;

function secreto(): string {
  const valor = process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!valor) {
    throw new Error("Falta ADMIN_PASSWORD (y AUTH_SECRET) en las variables de entorno.");
  }
  return valor;
}

function firmar(carga: string): string {
  return createHmac("sha256", secreto()).update(carga).digest("base64url");
}

function igualesEnTiempoConstante(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function passwordCorrecta(intento: string): boolean {
  const esperada = process.env.ADMIN_PASSWORD;
  if (!esperada) return false;
  return igualesEnTiempoConstante(intento, esperada);
}

export function valorDeSesion(): string {
  const expira = Date.now() + DIAS * 24 * 60 * 60 * 1000;
  return `${expira}.${firmar(String(expira))}`;
}

export function sesionValida(valor: string | undefined): boolean {
  if (!valor) return false;

  const [expira, firma] = valor.split(".");
  if (!expira || !firma) return false;
  if (!igualesEnTiempoConstante(firma, firmar(expira))) return false;

  return Number(expira) > Date.now();
}

export function haySesion(): boolean {
  try {
    return sesionValida(cookies().get(NOMBRE_COOKIE)?.value);
  } catch {
    return false;
  }
}

export const COOKIE = {
  nombre: NOMBRE_COOKIE,
  opciones: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: DIAS * 24 * 60 * 60,
  },
};

export const hayPanelConfigurado = Boolean(process.env.ADMIN_PASSWORD);
