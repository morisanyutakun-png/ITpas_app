import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "ITパスポート",
    "iパス",
    "過去問",
    "理解",
    "誤解パターン",
    "学習",
    "資格試験",
  ],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background text-foreground">
        <header className="border-b">
          <div className="container flex h-14 items-center gap-6">
            <Link href="/" className="font-semibold">
              ITパス理解ノート
            </Link>
            <nav className="flex gap-4 text-sm text-muted-foreground overflow-x-auto">
              <Link href="/learn" className="hover:text-foreground whitespace-nowrap">
                学習
              </Link>
              <Link href="/learn/questions" className="hover:text-foreground whitespace-nowrap">
                問題一覧
              </Link>
              <Link href="/topics" className="hover:text-foreground whitespace-nowrap">
                論点
              </Link>
              <Link href="/misconceptions" className="hover:text-foreground whitespace-nowrap">
                誤解パターン
              </Link>
              <Link href="/dashboard" className="hover:text-foreground whitespace-nowrap">
                ダッシュボード
              </Link>
            </nav>
          </div>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="border-t py-6 text-center text-xs text-muted-foreground space-y-1">
          <div>© {new Date().getFullYear()} {siteConfig.name}</div>
          <div>
            ITパスポート試験の問題は IPA (情報処理推進機構) の著作物です。本サイトは学習目的で構造化・解説しています。
          </div>
        </footer>
      </body>
    </html>
  );
}
