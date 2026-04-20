import { config as loadDotenv } from "dotenv";
loadDotenv({ path: ".env.local" });

import fs from "node:fs";
import path from "node:path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Applies one or more raw SQL files against DATABASE_URL. The SQL files are
 * expected to be idempotent (use IF NOT EXISTS / DO $$ BEGIN EXCEPTION guards).
 *
 * Usage:
 *   tsx scripts/applyRawSql.ts drizzle/migrations/0004_monetization.sql
 *   tsx scripts/applyRawSql.ts drizzle/migrations/0004_monetization.sql drizzle/migrations/0005_premium_tier.sql
 *
 * If no files are given, it applies every drizzle/migrations/NNNN_*.sql that
 * has a 4-digit prefix >= 0004 (safe default — older migrations are assumed
 * to have been applied via drizzle-kit already).
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const args = process.argv.slice(2);
  const files =
    args.length > 0
      ? args
      : fs
          .readdirSync("drizzle/migrations")
          .filter((f) => /^\d{4}_.*\.sql$/.test(f))
          .filter((f) => {
            const idx = parseInt(f.slice(0, 4), 10);
            return idx >= 4;
          })
          .sort()
          .map((f) => path.join("drizzle/migrations", f));

  if (files.length === 0) {
    console.log("No SQL files to apply.");
    return;
  }

  const sql = neon(url) as NeonQueryFunction<false, false> & {
    query?: (q: string, params?: unknown[]) => Promise<unknown>;
  };

  async function run(stmt: string): Promise<void> {
    // Neon HTTP driver: the `sql.query(text, params)` form accepts raw SQL.
    // In older versions it's just callable: `sql(text, params)`.
    if (typeof sql.query === "function") {
      await sql.query(stmt);
      return;
    }
    await (sql as unknown as (q: string, p?: unknown[]) => Promise<unknown>)(
      stmt,
      []
    );
  }

  for (const file of files) {
    const body = fs.readFileSync(file, "utf8");
    const statements = splitSqlStatements(body);
    console.log(`\n▶ ${file}  (${statements.length} statement${statements.length === 1 ? "" : "s"})`);
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (!trimmed) continue;
      try {
        await run(trimmed);
        console.log(`  ✓ ${preview(trimmed)}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // PostgreSQL-specific benign errors from idempotent retries.
        if (
          msg.includes("already exists") ||
          msg.includes("duplicate_object")
        ) {
          console.log(`  ~ skip (already applied): ${preview(trimmed)}`);
          continue;
        }
        console.error(`  ✗ ${preview(trimmed)}`);
        throw e;
      }
    }
  }

  console.log("\nDone.");
}

function splitSqlStatements(body: string): string[] {
  // Prefer drizzle's breakpoint marker if present.
  if (body.includes("--> statement-breakpoint")) {
    return body
      .split(/--> statement-breakpoint/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  // Otherwise, naive split on semicolons at end of line, respecting DO $$ blocks.
  const out: string[] = [];
  let buf = "";
  let inDollarBlock = false;
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (/\$\$/.test(trimmed)) {
      inDollarBlock = !inDollarBlock;
    }
    buf += line + "\n";
    if (!inDollarBlock && trimmed.endsWith(";")) {
      out.push(buf);
      buf = "";
    }
  }
  if (buf.trim()) out.push(buf);
  return out;
}

function preview(s: string): string {
  const oneline = s.replace(/\s+/g, " ");
  return oneline.length > 80 ? oneline.slice(0, 80) + "…" : oneline;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
