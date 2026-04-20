import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { UserMenu } from "@/components/UserMenu";

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

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap transition"
    >
      {label}
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container flex h-14 items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-black text-white shadow-sm">
                理
              </span>
              <span>理解ノート</span>
            </Link>
            <nav className="flex gap-1 text-sm overflow-x-auto flex-1">
              <NavLink href="/learn" label="学習" />
              <NavLink href="/learn/questions" label="問題" />
              <NavLink href="/guides" label="ガイド" />
              <NavLink href="/topics" label="論点" />
              <NavLink href="/misconceptions" label="誤解" />
              <NavLink href="/dashboard" label="DB" />
              <NavLink href="/history" label="履歴" />
              <NavLink href="/pricing" label="料金" />
            </nav>
            <Suspense fallback={null}>
              <UserMenu />
            </Suspense>
          </div>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="border-t py-6 text-center text-xs text-slate-500 space-y-1.5">
          <div>© {new Date().getFullYear()} {siteConfig.name}</div>
          <div>
            ITパスポート試験の問題は IPA (情報処理推進機構) の著作物です。本サイトは学習目的での引用・構造化・解説を行っています。
          </div>
          <div>
            <Link href="/legal" className="underline hover:text-slate-700">
              著作権・引用について
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
