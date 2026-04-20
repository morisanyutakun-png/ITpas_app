"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Timer, BarChart3, User } from "lucide-react";

const TABS = [
  { href: "/", label: "ホーム", icon: Home, matchPrefix: false },
  { href: "/learn/questions", label: "問題", icon: BookOpen, matchPrefix: true },
  { href: "/learn/mock-exam", label: "模試", icon: Timer, matchPrefix: true },
  { href: "/dashboard", label: "分析", icon: BarChart3, matchPrefix: true },
  { href: "/account", label: "アカウント", icon: User, matchPrefix: true },
] as const;

/**
 * iOS-style bottom tab bar. Visible on mobile only (hidden ≥ md).
 *
 * We bias to 5 primary destinations; secondary destinations (ガイド / 論点 /
 * 履歴 / ブックマーク / 料金) stay accessible from within those pages — the
 * tab bar optimises for one-tap reach, not a full sitemap.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="主要ナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((tab) => {
          const active = tab.matchPrefix
            ? pathname === tab.href || pathname.startsWith(`${tab.href}/`)
            : pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon
                className="h-[22px] w-[22px]"
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
