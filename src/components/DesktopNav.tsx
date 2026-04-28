"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/home", label: "Home", matchPrefix: false },
  { href: "/learn/study", label: "Reading", matchPrefix: true },
  { href: "/learn", label: "Practice", matchPrefix: false },
  { href: "/dashboard", label: "Insights", matchPrefix: true },
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
