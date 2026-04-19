import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/learn/session/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
