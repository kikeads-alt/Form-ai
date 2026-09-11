import { sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import type { ArchivoSubido, BanderaActiva, EstadoEnvio, Respuestas } from "../types";

/**
 * Envíos completados.
 *
 * Las respuestas van en jsonb y no en una columna por pregunta: el cuestionario
 * va a cambiar entre versiones y no queremos una migración por cada pregunta
 * nueva. Las cuatro columnas de identidad existen solo para poder listar y
 * buscar sin abrir el jsonb.
 */
export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

    nombre: text("nombre").notNull(),
    correo: text("correo").notNull(),
    cargo: text("cargo").notNull(),
    empresa: text("empresa").notNull(),

    respuestas: jsonb("respuestas").$type<Respuestas>().notNull().default({}),
    archivos: jsonb("archivos").$type<ArchivoSubido[]>().notNull().default([]),
    banderas: jsonb("banderas").$type<BanderaActiva[]>().notNull().default([]),

    estado: text("estado").$type<EstadoEnvio>().notNull().default("nueva"),
    versionFormulario: text("version_formulario").notNull(),
  },
  (tabla) => ({
    porFecha: index("submissions_created_at_idx").on(sql`${tabla.createdAt} DESC`),
    porBanderas: index("submissions_banderas_idx").using("gin", tabla.banderas),
  }),
);

/**
 * Borradores en curso. Deliberadamente en otra tabla: un formulario a medias
 * no es un envío y no debe aparecer en el panel. Se borran al enviar y caducan
 * solos a los 30 días.
 */
export const drafts = pgTable(
  "drafts",
  {
    token: text("token").primaryKey(),
    correo: text("correo").notNull(),
    datos: jsonb("datos").$type<Respuestas>().notNull().default({}),
    seccion: integer("seccion").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    expiraEn: timestamp("expira_en", { withTimezone: true }).notNull(),
  },
  (tabla) => ({
    porCorreo: index("drafts_correo_idx").on(tabla.correo),
  }),
);

export type FilaEnvio = typeof submissions.$inferSelect;
export type FilaBorrador = typeof drafts.$inferSelect;
