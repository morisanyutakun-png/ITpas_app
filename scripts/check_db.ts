import { config as loadDotenv } from "dotenv";
loadDotenv({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const tables = ["users", "topics", "misconceptions", "materials", "questions", "choices", "attempts", "sessions"];
  for (const t of tables) {
    const r = await sql(`SELECT COUNT(*)::int AS c FROM ${t}`);
    console.log(`${t.padEnd(18)} ${(r as { c: number }[])[0].c}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
