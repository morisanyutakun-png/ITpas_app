import Link from "next/link";
import { ArrowUpRight, ChevronRight, Network } from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { getRoadmap } from "@/server/queries/roadmap";

export const dynamic = "force-dynamic";
export const metadata = { title: "論点マップ" };

const MAJOR_META: Record<
  string,
  { hue: string; hueDim: string; label: string }
> = {
  strategy: {
    hue: "#FF375F",
    hueDim: "rgba(255,55,95,0.14)",
    label: "STRATEGY",
  },
  management: {
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.14)",
    label: "MANAGEMENT",
  },
  technology: {
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.14)",
    label: "TECHNOLOGY",
  },
};

export default async function TopicsPage() {
  const user = await readCurrentUser();
  const majors = await getRoadmap(user?.id ?? null);

  const totalTopics = majors.reduce((a, m) => a + m.topicCount, 0);
  const totalMinors = majors.reduce((a, m) => a + m.minors.length, 0);

  return (
    <div className="space-y-8 pb-10">
      {/* ── Editorial header ───────────── */}
      <header className="space-y-1.5 pt-1">
        <div className="kicker">Topic Map</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          論点マップ
        </h1>
        <p className="text-[13.5px] text-muted-foreground text-pretty">
          IT パスポートの学習論点を領域ごとに整理。論点カードから演習と学習ノートへ。
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ios-red" />
            <span>
              <span className="num font-semibold text-foreground">
                {majors.length}
              </span>{" "}
              領域
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ios-orange" />
            <span>
              <span className="num font-semibold text-foreground">
                {totalMinors}
              </span>{" "}
              中項目
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ios-blue" />
            <span>
              <span className="num font-semibold text-foreground">
                {totalTopics}
              </span>{" "}
              論点
            </span>
          </span>
        </div>
      </header>

      {/* ── Major chapters ─────────────── */}
      {majors.map((m) => {
        const meta = MAJOR_META[m.major];
        if (!meta) return null;
        const pct =
          m.topicCount > 0
            ? Math.round((m.masteredCount / m.topicCount) * 100)
            : 0;
        return (
          <section key={m.major} className="space-y-3">
            {/* Chapter header */}
            <div className="surface-card flex items-center gap-4 overflow-hidden p-5">
              <div
                aria-hidden
                className="h-12 w-1 shrink-0 rounded-full"
                style={{ background: meta.hue }}
              />
              <div className="min-w-0 flex-1">
                <div
                  className="text-[10.5px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: meta.hue }}
                >
                  {meta.label} · {m.minors.length} areas
                </div>
                <div className="mt-0.5 text-[22px] font-semibold leading-tight tracking-tight">
                  {m.label}
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {m.intro}
                </div>
              </div>
              <div className="text-right">
                <div className="num text-[22px] font-semibold leading-none tracking-tight">
                  {pct}
                  <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
                    %
                  </span>
                </div>
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Mastery
                </div>
              </div>
            </div>

            {/* Minors */}
            <div className="space-y-4">
              {m.minors.map((minor) => (
                <div key={minor.minorTopic} className="space-y-2">
                  <div className="flex items-baseline justify-between px-1">
                    <div
                      className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: meta.hue }}
                    >
                      {minor.minorTopic}
                    </div>
                    <div className="num text-[10.5px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {minor.masteredCount}
                      </span>{" "}
                      / {minor.topicCount} 習熟
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {minor.topics.map((t) => (
                      <TopicCard
                        key={t.slug}
                        slug={t.slug}
                        title={t.title}
                        summary={t.summary}
                        attempted={t.attempted}
                        rate={t.correctRate}
                        level={t.level}
                        hue={meta.hue}
                        hueDim={meta.hueDim}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TopicCard({
  slug,
  title,
  summary,
  attempted,
  rate,
  level,
  hue,
  hueDim,
}: {
  slug: string;
  title: string;
  summary: string;
  attempted: number;
  rate: number;
  level: 0 | 1 | 2 | 3;
  hue: string;
  hueDim: string;
}) {
  const levelLabel =
    level === 3
      ? "習熟"
      : level === 2
      ? "定着"
      : level === 1
      ? "伸ばす"
      : "未挑戦";
  const levelColor =
    level === 3
      ? "text-ios-green"
      : level === 2
      ? "text-ios-blue"
      : level === 1
      ? "text-ios-orange"
      : "text-muted-foreground";

  return (
    <Link
      href={`/topics/${slug}`}
      className="group relative overflow-hidden rounded-2xl bg-card p-4 ring-1 ring-black/[0.04] shadow-surface transition-transform active:scale-[0.99] dark:ring-white/[0.06]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.10] blur-2xl transition-opacity group-hover:opacity-[0.20]"
        style={{ background: hue }}
      />
      <div className="relative flex items-start gap-3">
        <span
          className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: hueDim, color: hue }}
        >
          <Network className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="truncate text-[14.5px] font-semibold">
              {title}
            </div>
            <span
              className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] ${levelColor}`}
            >
              {levelLabel}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground text-pretty">
            {summary || "タップで詳細を見る"}
          </p>
          {attempted > 0 ? (
            <div className="mt-2.5">
              <div className="flex items-baseline justify-between text-[10.5px] text-muted-foreground">
                <span>
                  <span className="num font-semibold text-foreground">
                    {Math.round(rate * 100)}%
                  </span>{" "}
                  正答
                </span>
                <span className="num">{attempted}問解答</span>
              </div>
              <div
                className="mt-1 h-1 overflow-hidden rounded-full"
                style={{ background: hueDim }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(3, rate * 100)}%`,
                    background: hue,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-0.5 text-[11px] text-muted-foreground transition-transform group-hover:translate-x-0.5">
              学習ノートを開く <ChevronRight className="h-3 w-3" />
            </div>
          )}
        </div>
        <ArrowUpRight
          className="absolute right-0 top-0 h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-70"
          strokeWidth={2.2}
        />
      </div>
    </Link>
  );
}
