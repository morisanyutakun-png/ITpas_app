export const siteConfig = {
  name: "ITパス理解ノート",
  shortName: "ITパス理解",
  description:
    "ITパスポートを『なぜ間違えたか』『どの論点とつながっているか』『どの誤解で落ちているか』で攻略する、理解特化型の学習ノート。",
  // The Vercel-injected URL is preferred; fall back to localhost for dev.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
};

export type SiteConfig = typeof siteConfig;
