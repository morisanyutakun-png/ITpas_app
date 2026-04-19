import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { materials } from "@/db/schema";

export async function getMaterial(slug: string) {
  return db.query.materials.findFirst({ where: eq(materials.slug, slug) });
}
