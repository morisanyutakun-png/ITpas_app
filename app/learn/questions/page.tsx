import Link from "next/link";
import { Shuffle, Crosshair, ArrowRight, ChevronRight } from "lucide-react";
import { listQuestions } from "@/server/queries/questions";
import { pickMajor } from "@/lib/design";

export const dynamic = "force-dynamic";

const MAJOR_LABEL: Record<string, string> = {
  strategy: "ストラテジ系",
  management: "マネジメント系",
  technology: "テクノロジ系",
};

export default async function QuestionsListPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    major?: string;
    topic?: string;
    misconception?: string;
    origin?: string;
  }>;
}) {
  const sp = await searchParams;
  const items = await listQuestions({
    examYear: sp.year ? Number(sp.year) : undefined,
    majorCategory: sp.major as "strategy" | "management" | "technology" | undefined,
    topicSlug: sp.topic,
    misconceptionSlug: sp.misconception,
    originType:
      sp.origin === "actual"
        ? "ipa_actual"
        : sp.origin === "inspired"
          ? "ipa_inspired"
          : undefined,
  });

  // Group by year then by major category for ToC layout
  const byYear = items.reduce<Record<number, typeof items>>((acc, q) => {
    (acc[q.examYear] ||= []).push(q);
    return acc;
  }, {});
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a); // newest first

  const randomQs = new URLSearchParams();
  if (sp.major) randomQs.set("major", sp.major);
  if (sp.origin) randomQs.set("origin", sp.origin);
  const randomHref = `/learn/random${randomQs.toString() ? `?${randomQs}` : ""}`;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">問題集</h1>
        <p className="text-sm text-slate-600">
          ランダム1問から始めるか、目次から好きな問題へ。
        </p>
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={randomHref}
          className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-4 transition hover:border-slate-400 hover:shadow-md"
        >
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-15 blur-xl group-hover:opacity-25 transition" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow">
              <Shuffle className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-slate-900">ランダムに1問</div>
              <div className="text-[11px] text-slate-500">いま絞り込んだ範囲から</div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
        <Link
          href="/learn/session/new?mode=weakness&count=5"
          className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-4 transition hover:border-slate-400 hover:shadow-md"
        >
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 opacity-15 blur-xl group-hover:opacity-25 transition" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow">
              <Crosshair className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-slate-900">弱点5問</div>
              <div className="text-[11px] text-slate-500">誤解パターン重み付き</div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>

      {/* Filter chips — minimal */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <Chip href="/learn/questions" label="すべて" active={!sp.major && !sp.origin} />
          <Chip href="/learn/questions?major=strategy" label="ストラテジ" active={sp.major === "strategy"} />
          <Chip href="/learn/questions?major=management" label="マネジメント" active={sp.major === "management"} />
          <Chip href="/learn/questions?major=technology" label="テクノロジ" active={sp.major === "technology"} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip href="/learn/questions?origin=actual" label="🏛 公式過去問のみ" active={sp.origin === "actual"} />
          <Chip href="/learn/questions?origin=inspired" label="✨ オリジナルのみ" active={sp.origin === "inspired"} />
        </div>
      </div>

      <div className="text-xs text-slate-500">{items.length} 問が見つかりました</div>

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-600">
          該当する問題がありません。
        </div>
      ) : (
        <div className="space-y-6">
          {years.map((y) => {
            const qs = byYear[y];
            const byMajor = qs.reduce<Record<string, typeof qs>>((acc, q) => {
              (acc[q.majorCategory] ||= []).push(q);
              return acc;
            }, {});
            return (
              <section key={y} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <header className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b">
                  <h2 className="text-base font-black tracking-tight">令和{y}年度</h2>
                  <span className="text-[11px] font-bold text-slate-500">{qs.length}問</span>
                </header>
                <div className="divide-y">
                  {(["strategy", "management", "technology"] as const).map((m) => {
                    const list = byMajor[m];
                    if (!list || list.length === 0) return null;
                    const theme = pickMajor(m);
                    return (
                      <div key={m} className="px-5 py-3 space-y-1.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${theme.gradient}`} />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            {MAJOR_LABEL[m]}
                          </span>
                          <span className="text-[10px] text-slate-400">{list.length}</span>
                        </div>
                        <ul className="-mx-2">
                          {list
                            .sort((a, b) => a.questionNumber - b.questionNumber)
                            .map((q) => (
                              <li key={q.id}>
                                <Link
                                  href={`/learn/questions/${q.id}`}
                                  className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 transition"
                                >
                                  <span
                                    className={`flex h-7 w-9 shrink-0 items-center justify-center rounded-md text-[11px] font-black ${
                                      q.originType === "ipa_actual"
                                        ? "bg-slate-900 text-white"
                                        : "bg-violet-100 text-violet-800"
                                    }`}
                                  >
                                    {q.questionNumber}
                                  </span>
                                  <span className="flex-1 text-sm text-slate-800 line-clamp-1 group-hover:text-slate-950">
                                    {q.stem}
                                  </span>
                                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition" />
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      {label}
    </Link>
  );
}
