import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { UserMenu } from "@/components/UserMenu";
import { MobileTabBar } from "@/components/MobileTabBar";

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

// The header reads the session/anon cookie — keep the layout dynamic.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

import { DesktopNav } from "@/components/DesktopNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <header className="sticky top-0 z-30 border-b border-border/50 glass-bar">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-5 px-4 md:px-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-[15.5px] font-semibold tracking-tight"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-grad-ink text-[12px] font-bold text-white shadow-tile">
                理
              </span>
              <span className="hidden sm:inline">理解ノート</span>
            </Link>
            <DesktopNav />
            <div className="ml-auto">
              <Suspense fallback={null}>
                <UserMenu />
              </Suspense>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+96px)] md:max-w-5xl md:px-6 md:pt-10 md:pb-20">
          {children}
        </main>

        <footer className="hidden border-t border-border/50 py-8 text-center text-[11px] text-muted-foreground md:block">
          <div className="mx-auto max-w-5xl px-6">
            <div>© {new Date().getFullYear()} {siteConfig.name}</div>
            <div className="mt-1">
              ITパスポート試験の問題はIPAの著作物です。
              <Link href="/legal" className="ml-1 underline underline-offset-2 hover:text-foreground">
                著作権・引用について
              </Link>
            </div>
          </div>
        </footer>

        <MobileTabBar />
      </body>
    </html>
  );
}
