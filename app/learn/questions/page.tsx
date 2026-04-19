import Link from "next/link";
import { listQuestions } from "@/server/queries/questions";
import { pickFormat, pickMajor } from "@/lib/design";

export const dynamic = "force-dynamic";

export default async function QuestionsListPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    major?: string;
    topic?: string;
    misconception?: string;
  }>;
}) {
  const sp = await searchParams;
  const items = await listQuestions({
    examYear: sp.year ? Number(sp.year) : undefined,
    majorCategory: sp.major as "strategy" | "management" | "technology" | undefined,
    topicSlug: sp.topic,
    misconceptionSlug: sp.misconception,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">問題一覧</h1>
          <p className="text-sm text-slate-600">タップして1問ずつ解く</p>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
          {items.length} Q
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip href="/learn/questions" label="すべて" active={!sp.year && !sp.major} />
        <FilterChip
          href="/learn/questions?major=strategy"
          label="ストラテジ"
          active={sp.major === "strategy"}
          tone="from-violet-500 to-fuchsia-500"
        />
        <FilterChip
          href="/learn/questions?major=management"
          label="マネジメント"
          active={sp.major === "management"}
          tone="from-sky-500 to-cyan-500"
        />
        <FilterChip
          href="/learn/questions?major=technology"
          label="テクノロジ"
          active={sp.major === "technology"}
          tone="from-emerald-500 to-teal-500"
        />
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-600">
          該当する問題がありません。<br />
          <code className="text-xs">content/structured/questions/</code> に追加して <code className="text-xs">npm run seed</code> を実行してください。
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((q) => {
            const major = pickMajor(q.majorCategory);
            const fmt = pickFormat(q.formatType);
            const FmtIcon = fmt.icon;
            return (
              <Link
                key={q.id}
                href={`/learn/questions/${q.id}`}
                className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-400 hover:shadow-md"
              >
                <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${major.gradient}`} />
                <div className="space-y-2 pl-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${major.chip}`}>
                      {major.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      <FmtIcon className={`h-3 w-3 ${fmt.color}`} />
                      {fmt.label}
                    </span>
                    <span className="ml-auto text-[11px] font-bold text-slate-500">
                      R{q.examYear} 第{q.questionNumber}問
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 line-clamp-2 group-hover:text-slate-950">{q.stem}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
  tone,
}: {
  href: string;
  label: string;
  active: boolean;
  tone?: string;
}) {
  if (active && tone) {
    return (
      <Link
        href={href}
        className={`rounded-full bg-gradient-to-r ${tone} px-3.5 py-1.5 text-sm font-bold text-white shadow`}
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}
