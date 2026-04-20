"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/home", label: "ホーム", matchPrefix: false },
  { href: "/learn/questions", label: "問題", matchPrefix: true },
  { href: "/learn/mock-exam", label: "模試", matchPrefix: true },
  { href: "/dashboard", label: "分析", matchPrefix: true },
  { href: "/bookmarks", label: "保存", matchPrefix: true },
  { href: "/topics", label: "論点", matchPrefix: true },
  { href: "/pricing", label: "料金", matchPrefix: true },
] as const;

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden flex-1 items-center gap-0.5 md:flex">
      {LINKS.map((l) => {
        const active = l.matchPrefix
          ? pathname === l.href || pathname.startsWith(`${l.href}/`)
          : pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className="nav-pill"
            data-active={active || undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
