import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { readCurrentUser } from "@/lib/currentUser";

export const dynamic = "force-dynamic";

/**
 * Marketing shell for public pages (LP, pricing, legal).
 *
 * Minimal chrome — the LP itself is the main visual moment, so the
 * header stays out of the way. Signed-in visitors get a "アプリを開く"
 * pill in place of the login button.
 */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await readCurrentUser();
  const signedIn = !!user?.isSignedIn;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border/40 glass-bar">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[15.5px] font-semibold tracking-tight"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-grad-ink text-[12px] font-bold text-white shadow-tile">
              理
            </span>
            <span>理解ノート</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            <Link
              href="/pricing"
              className="hidden rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              料金
            </Link>
            <Link
              href="/legal"
              className="hidden rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              著作権
            </Link>
            {signedIn ? (
              <Link
                href="/home"
                className="pill-primary ml-1 h-9 gap-1 px-3.5 text-[13px]"
              >
                アプリを開く
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href="/api/auth/google/login?returnTo=/home"
                className="pill-neutral ml-1 h-9 gap-1 px-3.5 text-[13px]"
              >
                Googleで始める
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-14">
        {children}
      </main>

      <footer className="border-t border-border/40 py-10 text-center text-[11.5px] text-muted-foreground">
        <div className="mx-auto max-w-6xl space-y-2 px-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[12px]">
            <Link href="/" className="hover:text-foreground">
              ホーム
            </Link>
            <span className="text-border">·</span>
            <Link href="/pricing" className="hover:text-foreground">
              料金
            </Link>
            <span className="text-border">·</span>
            <Link href="/legal" className="hover:text-foreground">
              著作権・引用
            </Link>
          </div>
          <div>© {new Date().getFullYear()} {siteConfig.name}</div>
          <div className="text-[10.5px]">
            ITパスポート試験の問題はIPA（独立行政法人 情報処理推進機構）の著作物です。
          </div>
        </div>
      </footer>
    </div>
  );
}
