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
    { media: "(prefers-color-scheme: light)", color: "#F2F2F7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-[14px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
      <body className="min-h-screen bg-background text-foreground antialiased">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-12 max-w-5xl items-center gap-4 px-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
                理
              </span>
              <span>理解ノート</span>
            </Link>
            <nav className="hidden flex-1 items-center gap-0.5 md:flex">
              <NavLink href="/" label="ホーム" />
              <NavLink href="/learn/questions" label="問題" />
              <NavLink href="/learn/mock-exam" label="模試" />
              <NavLink href="/dashboard" label="分析" />
              <NavLink href="/bookmarks" label="保存" />
              <NavLink href="/topics" label="論点" />
              <NavLink href="/pricing" label="料金" />
            </nav>
            <div className="ml-auto md:ml-0">
              <Suspense fallback={null}>
                <UserMenu />
              </Suspense>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+88px)] md:max-w-5xl md:px-6 md:pt-8 md:pb-16">
          {children}
        </main>

        <footer className="hidden border-t border-border/60 py-6 text-center text-[11px] text-muted-foreground md:block">
          <div>© {new Date().getFullYear()} {siteConfig.name}</div>
          <div className="mt-1">
            ITパスポート試験の問題はIPAの著作物です。
            <Link href="/legal" className="ml-1 underline hover:text-foreground">
              著作権・引用について
            </Link>
          </div>
        </footer>

        <MobileTabBar />
      </body>
    </html>
  );
}
