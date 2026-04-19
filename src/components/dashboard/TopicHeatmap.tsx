import Link from "next/link";
import type { TopicProgress } from "@/server/queries/progress";
import { pickMajor } from "@/lib/design";

function colorFor(rate: number, attempted: number) {
  if (attempted === 0) return "bg-slate-100 text-slate-500 border-slate-200";
  if (rate < 0.4) return "bg-rose-500 text-white border-rose-600";
  if (rate < 0.6) return "bg-amber-400 text-amber-950 border-amber-500";
  if (rate < 0.8) return "bg-yellow-200 text-amber-900 border-yellow-300";
  return "bg-emerald-400 text-white border-emerald-500";
}

export function TopicHeatmap({ items }: { items: TopicProgress[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-600">
        まだ十分な解答がありません。問題を解くと論点別に色がつきます。
      </div>
    );
  }
  const grouped = items.reduce<Record<string, TopicProgress[]>>((acc, t) => {
    (acc[t.majorCategory] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([major, list]) => {
        const theme = pickMajor(major);
        const MajorIcon = theme.icon;
        return (
          <div key={major} className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${theme.chip}`}
              >
                <MajorIcon className="h-3.5 w-3.5" />
                {theme.label}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((t) => {
                const pct = Math.round(t.correctRate * 100);
                return (
                  <Link key={t.slug} href={`/topics/${t.slug}`}>
                    <div className={`relative overflow-hidden rounded-xl border-2 p-3 transition hover:shadow-md ${colorFor(t.correctRate, t.attempted)}`}>
                      <div className="font-semibold text-sm line-clamp-1">{t.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] opacity-90">
                        <span className="font-bold">{pct}%</span>
                        <span>
                          {t.correct}/{t.attempted}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
