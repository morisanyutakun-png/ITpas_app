import Link from "next/link";
import { AlertTriangle, ChevronRight, Flame, Skull, Target } from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import {
  listMisconceptionsWithStats,
  type MisconceptionWithStats,
} from "@/server/queries/misconceptions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "誤解パターン辞典",
  description:
    "ITパスポートで頻出するひっかけ・取り違えの典型例。問題ごとに紐付き、苦手分析の軸になります。",
};

export default async function MisconceptionsPage() {
  const user = await readCurrentUser();
  const items = await listMisconceptionsWithStats(user?.id ?? null);

  // Biggest enemies: ordered by incorrect rate, min 2 attempts. Falls back to
  // the most heavily-linked patterns when the user has little history.
  const enemies = items
    .filter((m) => m.attempted >= 2)
    .sort((a, b) => b.incorrectRate - a.incorrectRate)
    .slice(0, 3);
  const featured = enemies.length
    ? enemies
    : [...items].sort((a, b) => b.usageCount - a.usageCount).slice(0, 3);
  const featuredSlugs = new Set(featured.map((m) => m.slug));
  const rest = items.filter((m) => !featuredSlugs.has(m.slug));

  return (
    <div className="space-y-8 pb-10">
      {/* ── Editorial header ─────────────── */}
      <header className="space-y-1.5 pt-1">
        <div className="kicker">Trap Dictionary</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          誤解パターン辞典
        </h1>
        <p className="text-[13.5px] text-muted-foreground text-pretty">
          頻出ひっかけの「正体」を事前に知る。問題ごとに紐付き、あなたの苦手分析の軸になります。
        </p>
      </header>

      {/* ── Featured enemies — editorial hero row ── */}
      <section className="space-y-3">
        <div className="flex items-end justify-between px-1">
          <div className="min-w-0">
            <div className="kicker">
              {enemies.length ? "Your Top Enemies" : "Most Common Traps"}
            </div>
            <div className="mt-1 text-[19px] font-semibold tracking-tight">
              {enemies.length ? "あなたが取り違えやすい" : "よく出るひっかけ上位"}
            </div>
            <div className="text-[12px] text-muted-foreground">
              {enemies.length
                ? "直近の誤答傾向から導出"
                : "登場問題数ベースの頻出ランキング"}
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {featured.map((m, i) => (
            <EnemyCard key={m.slug} item={m} rank={i + 1} personalized={enemies.length > 0} />
          ))}
        </div>
      </section>

      {/* ── A-Z dictionary grid ─────────── */}
      <section className="space-y-3">
        <div className="rule-label">Dictionary · すべて</div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {rest.map((m) => (
            <TrapCard key={m.slug} item={m} />
          ))}
        </div>
      </section>

      <div className="px-1 text-[11.5px] text-muted-foreground text-pretty">
        誤解パターンは、問題と 1対多 で紐付きます。タップで定義・典型例・回避ヒントを読めます。
      </div>
    </div>
  );
}

function EnemyCard({
  item,
  rank,
  personalized,
}: {
  item: MisconceptionWithStats;
  rank: number;
  personalized: boolean;
}) {
  // Severity color scale for personalized (your) enemies.
  const rate = item.incorrectRate;
  const hue = personalized
    ? rate >= 0.5
      ? "#FF3B30"
      : rate >= 0.3
      ? "#FF9500"
      : "#FFCC00"
    : "#AF52DE";
  const hueDim = personalized
    ? rate >= 0.5
      ? "rgba(255,59,48,0.12)"
      : rate >= 0.3
      ? "rgba(255,149,0,0.12)"
      : "rgba(255,204,0,0.14)"
    : "rgba(175,82,222,0.14)";

  return (
    <Link
      href={`/misconceptions/${item.slug}`}
      className="group surface-card relative block overflow-hidden p-5 transition-transform active:scale-[0.99]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full opacity-[0.14] blur-2xl transition-opacity group-hover:opacity-[0.25]"
        style={{ background: hue }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className="album-glyph text-[44px] leading-none"
          style={{ color: hue, opacity: 0.85 }}
        >
          #{rank}
        </span>
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: hueDim, color: hue }}
        >
          {personalized ? (
            <Flame className="h-4 w-4" strokeWidth={2.2} />
          ) : (
            <Skull className="h-4 w-4" strokeWidth={2.2} />
          )}
        </span>
      </div>
      <div className="relative mt-4">
        <div
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: hue }}
        >
          {personalized
            ? `誤答率 ${Math.round(rate * 100)}%`
            : `出題 ${item.usageCount}問`}
        </div>
        <div className="mt-0.5 text-[16px] font-semibold leading-tight tracking-tight">
          {item.title}
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground text-pretty">
          {item.definition}
        </p>
      </div>
      {personalized && item.attempted > 0 && (
        <div className="relative mt-3">
          <div
            className="h-1 overflow-hidden rounded-full"
            style={{ background: hueDim }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(4, rate * 100)}%`,
                background: hue,
              }}
            />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground num">
            {item.attempted}問中の誤答傾向
          </div>
        </div>
      )}
    </Link>
  );
}

function TrapCard({ item }: { item: MisconceptionWithStats }) {
  const hasHistory = item.attempted >= 2;
  const danger = hasHistory && item.incorrectRate >= 0.4;
  const hue = danger
    ? "#FF3B30"
    : hasHistory && item.incorrectRate >= 0.2
    ? "#FF9500"
    : "#8E8E93";

  return (
    <Link
      href={`/misconceptions/${item.slug}`}
      className="group flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-black/[0.04] shadow-surface transition-transform active:scale-[0.99] dark:ring-white/[0.06]"
    >
      <span
        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background:
            hue === "#8E8E93" ? "rgba(142,142,147,0.1)" : `${hue}1f`,
          color: hue,
        }}
      >
        {danger ? (
          <AlertTriangle className="h-4 w-4" strokeWidth={2.2} />
        ) : (
          <Target className="h-4 w-4" strokeWidth={2.2} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="truncate text-[14.5px] font-semibold">
            {item.title}
          </div>
          <div className="shrink-0 text-[10.5px] text-muted-foreground num">
            {hasHistory ? (
              <span style={{ color: hue }}>
                誤答 {Math.round(item.incorrectRate * 100)}%
              </span>
            ) : (
              <>{item.usageCount}問</>
            )}
          </div>
        </div>
        <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground text-pretty">
          {item.definition}
        </p>
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
