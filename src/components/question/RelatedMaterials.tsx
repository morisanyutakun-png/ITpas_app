import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Markdown } from "@/lib/markdown";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  primary: { label: "まずこれ", cls: "bg-emerald-100 text-emerald-800" },
  compare: { label: "比較表", cls: "bg-sky-100 text-sky-800" },
  helper: { label: "補助", cls: "bg-slate-100 text-slate-700" },
};

export function RelatedMaterials({
  items,
}: {
  items: { slug: string; title: string; body: string; role: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
          <BookOpen className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div className="font-semibold text-slate-900">補助資料</div>
      </div>
      <div className="space-y-3">
        {items.map((m) => {
          const role = ROLE_BADGE[m.role] ?? ROLE_BADGE.helper;
          return (
            <div
              key={m.slug}
              className="rounded-xl border-2 border-slate-100 p-3 transition hover:border-sky-300"
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <Link
                  href={`/materials/${m.slug}`}
                  className="font-semibold text-sm text-slate-900 hover:text-sky-900 hover:underline truncate"
                >
                  {m.title}
                </Link>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${role.cls}`}
                >
                  {role.label}
                </span>
              </div>
              <Markdown>{m.body}</Markdown>
            </div>
          );
        })}
      </div>
    </div>
  );
}
