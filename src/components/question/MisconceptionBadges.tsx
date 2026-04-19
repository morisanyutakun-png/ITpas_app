import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function MisconceptionBadges({
  items,
}: {
  items: { slug: string; title: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          関連する誤解パターン
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((m) => (
          <Link
            key={m.slug}
            href={`/misconceptions/${m.slug}`}
            className="inline-flex items-center rounded-lg border-2 border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 transition hover:border-amber-400 hover:bg-amber-100"
          >
            {m.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
