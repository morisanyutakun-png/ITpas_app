"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Target, BarChart3 } from "lucide-react";

const TABS = [
  { href: "/home", label: "ホーム", icon: Home, matchPrefix: false },
  { href: "/learn/study", label: "学習", icon: BookOpen, matchPrefix: true },
  { href: "/learn", label: "演習", icon: Target, matchPrefix: false },
  { href: "/dashboard", label: "分析", icon: BarChart3, matchPrefix: true },
] as const;

/**
 * iOS 17-style bottom tab bar. Glass material with a tinted pill on the
 * active tab for crisper affordance (mirrors Apple Music's Now Playing bar).
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="主要ナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 glass-bar md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1.5 pt-1">
        {TABS.map((tab) => {
          const active = tab.matchPrefix
            ? pathname === tab.href || pathname.startsWith(`${tab.href}/`)
            : pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10.5px] font-semibold"
            >
              <span
                className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200 group-hover:bg-muted group-active:scale-95 ${
                  active
                    ? "bg-primary/12 text-primary group-hover:bg-primary/[0.18]"
                    : "text-muted-foreground group-hover:text-foreground group-active:text-foreground"
                }`}
              >
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={active ? 2.4 : 1.9}
                />
              </span>
              <span
                className={`truncate transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
