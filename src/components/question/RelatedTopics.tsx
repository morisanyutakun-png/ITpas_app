import Link from "next/link";
import { Network, ArrowRight } from "lucide-react";

export function RelatedTopics({
  items,
}: {
  items: { slug: string; title: string; summary: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
          <Network className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div className="font-semibold text-slate-900">関連する論点</div>
      </div>
      <div className="space-y-2">
        {items.map((t) => (
          <Link
            key={t.slug}
            href={`/topics/${t.slug}`}
            className="group flex items-start justify-between gap-3 rounded-xl border-2 border-slate-100 p-3 transition hover:border-violet-300 hover:bg-violet-50/50"
          >
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-slate-900 group-hover:text-violet-900">
                {t.title}
              </div>
              <div className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                {t.summary}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}
