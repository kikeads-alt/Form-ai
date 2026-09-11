import { cargarEnvLocal } from "./cargar-env";

cargarEnvLocal();

async function main() {
  const { listarEnvios } = await import("../lib/db/submissions");
  const { markdownBrief } = await import("../lib/markdown");

  const envios = await listarEnvios();
  if (envios.length === 0) {
    console.log("Sin envíos.");
    return;
  }
  console.log(markdownBrief(envios[0]));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
