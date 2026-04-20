import Link from "next/link";
import { ChevronRight, Crosshair, Lock, Shuffle } from "lucide-react";
import { listQuestions } from "@/server/queries/questions";
import { readCurrentUser } from "@/lib/currentUser";
import { minAllowedExamYear, planLabel } from "@/lib/plan";

export const dynamic = "force-dynamic";

const MAJOR_LABEL: Record<string, string> = {
  strategy: "ストラテジ",
  management: "マネジメント",
  technology: "テクノロジ",
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
  const user = await readCurrentUser();
  const plan = user?.plan ?? "free";
  const minYear = await minAllowedExamYear(plan);

  const yearParam = sp.year ? Number(sp.year) : undefined;
  const yearBlocked =
    yearParam !== undefined && minYear !== null && yearParam < minYear;

  const items = await listQuestions({
    examYear: yearBlocked ? undefined : yearParam,
    majorCategory: sp.major as
      | "strategy"
      | "management"
      | "technology"
      | undefined,
    topicSlug: sp.topic,
    misconceptionSlug: sp.misconception,
    originType:
      sp.origin === "actual"
        ? "ipa_actual"
        : sp.origin === "inspired"
        ? "ipa_inspired"
        : undefined,
    minYear,
  });

  const byYear = items.reduce<Record<number, typeof items>>((acc, q) => {
    (acc[q.examYear] ||= []).push(q);
    return acc;
  }, {});
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  const randomQs = new URLSearchParams();
  if (sp.major) randomQs.set("major", sp.major);
  if (sp.origin) randomQs.set("origin", sp.origin);
  const randomHref = `/learn/random${
    randomQs.toString() ? `?${randomQs}` : ""
  }`;

  return (
    <div className="space-y-5">
      <header className="pt-2">
        <h1 className="text-ios-title1 font-semibold">問題集</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          ランダム1問から始めるか、目次から好きな問題へ。
        </p>
      </header>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={randomHref}
          className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-ios-sm active:opacity-70"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ios-purple/10 text-ios-purple">
            <Shuffle className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">ランダム1問</div>
            <div className="text-[11px] text-muted-foreground">絞り込み範囲から</div>
          </div>
        </Link>
        <Link
          href="/learn/session/new?mode=weakness&count=5"
          className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-ios-sm active:opacity-70"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ios-red/10 text-ios-red">
            <Crosshair className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">弱点5問</div>
            <div className="text-[11px] text-muted-foreground">誤解パターン重み付き</div>
          </div>
        </Link>
      </div>

      {/* Filter chips (iOS-style scrollable) */}
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex min-w-max gap-1.5">
          <Chip href="/learn/questions" label="すべて" active={!sp.major && !sp.origin} />
          <Chip
            href="/learn/questions?major=strategy"
            label="ストラテジ"
            active={sp.major === "strategy"}
          />
          <Chip
            href="/learn/questions?major=management"
            label="マネジメント"
            active={sp.major === "management"}
          />
          <Chip
            href="/learn/questions?major=technology"
            label="テクノロジ"
            active={sp.major === "technology"}
          />
          <div className="w-2" />
          <Chip
            href="/learn/questions?origin=actual"
            label="公式過去問"
            active={sp.origin === "actual"}
          />
          <Chip
            href="/learn/questions?origin=inspired"
            label="オリジナル"
            active={sp.origin === "inspired"}
          />
        </div>
      </div>

      {minYear !== null && (
        <Link
          href="/pricing?reason=year_locked"
          className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-[13px] shadow-ios-sm active:opacity-80"
        >
          <Lock className="h-3.5 w-3.5 shrink-0 text-ios-orange" />
          <span className="flex-1 text-muted-foreground">
            <strong className="text-foreground">{planLabel(plan)}</strong>{" "}
            プランでは令和{minYear}年以降を表示中
            {yearBlocked && ` (令和${yearParam}年度はロック)`}
          </span>
          <span className="rounded-full bg-ios-purple/10 px-2 py-0.5 text-[11px] font-semibold text-ios-purple">
            Premium で解放
          </span>
        </Link>
      )}

      <div className="px-1 text-[12px] text-muted-foreground">
        {items.length}問が見つかりました
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 text-center text-[13px] text-muted-foreground shadow-ios-sm">
          該当する問題がありません。
        </div>
      ) : (
        <div className="space-y-5">
          {years.map((y) => {
            const qs = byYear[y];
            const byMajor = qs.reduce<Record<string, typeof qs>>((acc, q) => {
              (acc[q.majorCategory] ||= []).push(q);
              return acc;
            }, {});
            return (
              <section key={y} className="space-y-2">
                <div className="ios-section-label flex items-center justify-between">
                  <span>令和{y}年度</span>
                  <span className="text-muted-foreground">{qs.length}問</span>
                </div>
                <div className="space-y-3">
                  {(["strategy", "management", "technology"] as const).map(
                    (m) => {
                      const list = byMajor[m];
                      if (!list || list.length === 0) return null;
                      return (
                        <div key={m} className="ios-list shadow-ios-sm">
                          <div className="px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            {MAJOR_LABEL[m]} · {list.length}
                          </div>
                          {list
                            .sort((a, b) => a.questionNumber - b.questionNumber)
                            .map((q) => (
                              <Link
                                key={q.id}
                                href={`/learn/questions/${q.id}`}
                                className="ios-row items-start active:bg-muted/60"
                              >
                                <span
                                  className={`flex h-7 min-w-[28px] items-center justify-center rounded-md text-[11px] font-semibold tabular-nums ${
                                    q.originType === "ipa_actual"
                                      ? "bg-foreground text-background"
                                      : "bg-ios-purple/10 text-ios-purple"
                                  }`}
                                >
                                  {q.questionNumber}
                                </span>
                                <span className="line-clamp-2 flex-1 text-[14px]">
                                  {q.stem}
                                </span>
                                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              </Link>
                            ))}
                        </div>
                      );
                    }
                  )}
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
      className={`inline-flex h-8 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors ${
        active
          ? "bg-foreground text-background"
          : "bg-card text-foreground active:opacity-70"
      }`}
    >
      {label}
    </Link>
  );
}
