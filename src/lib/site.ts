export const siteConfig = {
  name: "ITpass",
  shortName: "ITpass",
  description:
    "ITパスポートのカリキュラムを地図で俯瞰し、現在地から過去問演習・模試・学習モードへ。誤解パターン単位で弱点を可視化する学習アプリ。",
  // The Vercel-injected URL is preferred; fall back to localhost for dev.
  url:
    (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
};

export type SiteConfig = typeof siteConfig;
