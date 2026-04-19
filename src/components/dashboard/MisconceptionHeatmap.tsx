import Link from "next/link";
import { Skull, Sparkles } from "lucide-react";
import type { MisconceptionProgress } from "@/server/queries/progress";

function gradeFor(rate: number) {
  if (rate >= 0.6) return { tier: "S", cls: "from-rose-600 to-red-600 text-white", chip: "bg-rose-100 text-rose-900" };
  if (rate >= 0.4) return { tier: "A", cls: "from-amber-500 to-orange-500 text-white", chip: "bg-amber-100 text-amber-900" };
  if (rate >= 0.2) return { tier: "B", cls: "from-yellow-300 to-amber-300 text-amber-900", chip: "bg-yellow-100 text-amber-900" };
  return { tier: "C", cls: "from-emerald-400 to-teal-400 text-white", chip: "bg-emerald-100 text-emerald-900" };
}

export function MisconceptionHeatmap({ items }: { items: MisconceptionProgress[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Sparkles className="h-7 w-7" />
        </div>
        <p className="text-sm text-slate-600">
          まだ十分な解答がありません。何問か解くと、ここに『敵キャラ』としてあなたの誤解パターンが現れます。
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => {
        const g = gradeFor(m.incorrectRate);
        const pct = Math.round(m.incorrectRate * 100);
        return (
          <Link key={m.slug} href={`/misconceptions/${m.slug}`} className="group">
            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-4 transition hover:border-slate-400 hover:shadow-lg">
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${g.cls} text-xl font-black shadow`}>
                  {g.tier}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-900 line-clamp-2 group-hover:text-slate-700">
                    {m.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${g.chip}`}>
                      誤答率 {pct}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {m.incorrect}/{m.attempted}
                    </span>
                  </div>
                  {/* progress bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${g.cls.split(" text-")[0]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <Skull className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-500" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
