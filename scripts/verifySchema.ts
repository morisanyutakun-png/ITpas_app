import { config as loadDotenv } from "dotenv";
loadDotenv({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const sql = neon(url);

  console.log("\n=== users columns ===");
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users' ORDER BY ordinal_position
  `;
  console.table(cols);

  console.log("\n=== plan enum values ===");
  const plans = await sql`
    SELECT unnest(enum_range(NULL::plan))::text AS plan
  `;
  console.table(plans);

  console.log("\n=== new tables ===");
  const t = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('bookmarks', 'notes')
    ORDER BY table_name
  `;
  console.table(t);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
