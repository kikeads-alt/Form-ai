CREATE TABLE "drafts" (
	"token" text PRIMARY KEY NOT NULL,
	"correo" text NOT NULL,
	"datos" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"seccion" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expira_en" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"nombre" text NOT NULL,
	"correo" text NOT NULL,
	"cargo" text NOT NULL,
	"empresa" text NOT NULL,
	"respuestas" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"archivos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"banderas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estado" text DEFAULT 'nueva' NOT NULL,
	"version_formulario" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "drafts_correo_idx" ON "drafts" USING btree ("correo");--> statement-breakpoint
CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at" DESC);--> statement-breakpoint
CREATE INDEX "submissions_banderas_idx" ON "submissions" USING gin ("banderas");