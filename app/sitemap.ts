import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    "",
    "/learn",
    "/learn/questions",
    "/topics",
    "/misconceptions",
    "/dashboard",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Topics/misconceptions/materials are dynamic but only listed in sitemap
  // when DATABASE_URL is configured (skip during build/preview without DB).
  if (!process.env.DATABASE_URL) {
    return staticEntries;
  }

  try {
    const { db } = await import("@/db/client");
    const { topics, misconceptions, materials } = await import("@/db/schema");
    const [ts, ms, mats] = await Promise.all([
      db.select({ slug: topics.slug, updatedAt: topics.updatedAt }).from(topics),
      db
        .select({ slug: misconceptions.slug, updatedAt: misconceptions.updatedAt })
        .from(misconceptions),
      db
        .select({ slug: materials.slug, updatedAt: materials.updatedAt })
        .from(materials),
    ]);

    return [
      ...staticEntries,
      ...ts.map((t) => ({
        url: `${base}/topics/${t.slug}`,
        lastModified: t.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...ms.map((m) => ({
        url: `${base}/misconceptions/${m.slug}`,
        lastModified: m.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...mats.map((m) => ({
        url: `${base}/materials/${m.slug}`,
        lastModified: m.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    return staticEntries;
  }
}
