import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { siteConfig } from "@/lib/site";
import { readCurrentUser } from "@/lib/currentUser";
import { UserMenu } from "@/components/UserMenu";
import { MobileTabBar } from "@/components/MobileTabBar";
import { DesktopNav } from "@/components/DesktopNav";

export const dynamic = "force-dynamic";

/**
 * App shell. All routes inside `(app)/` require a signed-in session —
 * anonymous / unauthenticated visitors are redirected to the landing
 * page (`/`) where they can start the Google sign-in flow.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await readCurrentUser();
  if (!user?.isSignedIn) {
    redirect("/");
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/50 glass-bar">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-5 px-4 md:px-6">
          <Link
            href="/home"
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
            <Link
              href="/legal"
              className="ml-1 underline underline-offset-2 hover:text-foreground"
            >
              著作権・引用について
            </Link>
          </div>
        </div>
      </footer>

      <MobileTabBar />
    </>
  );
}
