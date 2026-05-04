import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { misconceptionFileZ } from "@/lib/contentSchema";
import type { MisconceptionArchetype } from "@/lib/misconceptionArchetypes";

/**
 * slug → archetype の解決を、`content/structured/misconceptions/` の JSON から
 * 直接行う。DB に archetype 列を増やさず、Source of Truth (CLAUDE.md の原則) を
 * そのまま読む。プロセス起動後 1 度だけスキャンしてメモリにキャッシュする。
 */

const MISCONCEPTION_DIR = join(
  process.cwd(),
  "content",
  "structured",
  "misconceptions"
);

let cached: Map<string, MisconceptionArchetype> | null = null;

function buildMap(): Map<string, MisconceptionArchetype> {
  const map = new Map<string, MisconceptionArchetype>();
  let files: string[];
  try {
    files = readdirSync(MISCONCEPTION_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return map;
  }
  for (const f of files) {
    try {
      const raw = JSON.parse(readFileSync(join(MISCONCEPTION_DIR, f), "utf8"));
      const parsed = misconceptionFileZ.parse(raw);
      if (parsed.archetype) {
        map.set(parsed.slug, parsed.archetype);
      }
    } catch {
      // Skip malformed files; validate:content surfaces these in the build pipeline.
    }
  }
  return map;
}

export function getMisconceptionArchetypeMap(): Map<
  string,
  MisconceptionArchetype
> {
  if (!cached) cached = buildMap();
  return cached;
}

export function getMisconceptionArchetype(
  slug: string | null | undefined
): MisconceptionArchetype | null {
  if (!slug) return null;
  return getMisconceptionArchetypeMap().get(slug) ?? null;
}
