import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  PlayCircle,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { getGuideForMajor, getMajorInfo } from "@/server/queries/guides";
import { getRoadmap } from "@/server/queries/roadmap";
import { AccuracyRing } from "@/components/home/AccuracyRing";

export const dynamic = "force-dynamic";

const VALID = new Set(["strategy", "management", "technology"]);

const MAJOR_META: Record<
  string,
  { hue: string; hueDim: string; label: string; number: string }
> = {
  strategy: {
    hue: "#FF375F",
    hueDim: "rgba(255,55,95,0.12)",
    label: "STRATEGY",
    number: "01",
  },
  management: {
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.12)",
    label: "MANAGEMENT",
    number: "02",
  },
  technology: {
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.12)",
    label: "TECHNOLOGY",
    number: "03",
  },
};

export default async function GuideMajorPage({
  params,
}: {
  params: Promise<{ major: string }>;
}) {
  const { major } = await params;
  if (!VALID.has(major)) notFound();
  const info = getMajorInfo(major);
  if (!info) notFound();

  const user = await readCurrentUser();
  const [data, roadmap] = await Promise.all([
    getGuideForMajor(major as "strategy" | "management" | "technology"),
    getRoadmap(user?.id ?? null),
  ]);
  const m = roadmap.find(
    (r) => r.major === (major as "strategy" | "management" | "technology")
  );
  const meta = MAJOR_META[major];
  const pct =
    m && m.topicCount > 0
      ? Math.round((m.masteredCount / m.topicCount) * 100)
      : 0;

  // Group topics by minorTopic
  const byMinor = data.topics.reduce<Record<string, typeof data.topics>>(
    (acc, t) => {
      (acc[t.minorTopic] ||= []).push(t);
      return acc;
    },
    {}
  );
  // Mastery lookup from roadmap
  const levelBySlug = new Map<
    string,
    { level: 0 | 1 | 2 | 3; correctRate: number; attempted: number }
  >();
  m?.minors.forEach((mi) =>
    mi.topics.forEach((t) =>
      levelBySlug.set(t.slug, {
        level: t.level,
        correctRate: t.correctRate,
        attempted: t.attempted,
      })
    )
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground active:opacity-70"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="kicker !mt-0">Reading Guide</span>
      </Link>

      {/* ── Editorial chapter cover ── */}
      <header className="editorial-card relative overflow-hidden">
        <div className="relative z-10 grid gap-0 sm:grid-cols-[auto_1fr]">
          <div
            className="relative flex flex-col justify-between p-6 sm:w-[220px]"
            style={{
              background: `linear-gradient(160deg, ${meta.hue}14 0%, ${meta.hue}05 70%, transparent 100%)`,
            }}
          >
            <div
              aria-hidden
              className="album-glyph pointer-events-none absolute right-2 top-0 text-[130px] leading-none opacity-[0.22] sm:text-[160px]"
              style={{ color: meta.hue }}
            >
              {meta.number}
            </div>
            <div className="relative">
              <div
                className="text-[10.5px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: meta.hue }}
              >
                Chapter {meta.number}
              </div>
              <div className="mt-0.5 text-[11.5px] font-medium text-muted-foreground">
                {meta.label}
              </div>
            </div>
            <div className="relative mt-10 sm:mt-20">
              <AccuracyRing
                percent={user?.isSignedIn ? pct : null}
                size={80}
                thickness={7}
                label="MASTERY"
              />
            </div>
          </div>

          <div className="border-t border-border p-6 sm:border-l sm:border-t-0 sm:p-7">
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-balance">
              {info.label}
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
              {info.intro}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11.5px]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  論点
                </div>
                <div className="num mt-0.5 text-[18px] font-semibold tracking-tight">
                  {data.topics.length}
                </div>
              </div>
              <span aria-hidden className="h-7 w-px bg-border" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  問題
                </div>
                <div className="num mt-0.5 text-[18px] font-semibold tracking-tight">
                  {data.totalQuestions}
                </div>
              </div>
              <span aria-hidden className="h-7 w-px bg-border" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  中項目
                </div>
                <div className="num mt-0.5 text-[18px] font-semibold tracking-tight">
                  {Object.keys(byMinor).length}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/learn/session/new?mode=mixed&count=5`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-semibold text-background shadow-ios active:opacity-90"
              >
                <PlayCircle className="h-4 w-4" />
                この領域で5問
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Coverage (editorial "Covered") ── */}
      <section className="surface-card p-5">
        <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          Covered
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground/85 text-pretty">
          {info.coverage}
        </p>
      </section>

      {/* ── Minor groups → topic cards ── */}
      {Object.entries(byMinor).map(([minor, list]) => {
        const masteredInMinor = list.filter(
          (t) => (levelBySlug.get(t.slug)?.level ?? 0) === 3
        ).length;
        return (
          <section key={minor} className="space-y-3">
            <div className="flex items-baseline justify-between px-1">
              <div
                className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: meta.hue }}
              >
                {minor}
              </div>
              <div className="num text-[10.5px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {user?.isSignedIn ? masteredInMinor : list.length}
                </span>
                {user?.isSignedIn ? ` / ${list.length} 習熟` : " 論点"}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {list.map((t) => {
                const prog = levelBySlug.get(t.slug);
                return (
                  <GuideTopicCard
                    key={t.slug}
                    slug={t.slug}
                    title={t.title}
                    summary={t.summary}
                    hue={meta.hue}
                    hueDim={meta.hueDim}
                    attempted={prog?.attempted ?? 0}
                    rate={prog?.correctRate ?? 0}
                    level={prog?.level ?? 0}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function GuideTopicCard({
  slug,
  title,
  summary,
  hue,
  hueDim,
  attempted,
  rate,
  level,
}: {
  slug: string;
  title: string;
  summary: string;
  hue: string;
  hueDim: string;
  attempted: number;
  rate: number;
  level: 0 | 1 | 2 | 3;
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
      <div className="flex items-start gap-3">
        <span
          className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: hueDim, color: hue }}
        >
          <Layers className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="truncate text-[14.5px] font-semibold">{title}</div>
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
                <span className="num">{attempted}問</span>
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
              詳細を開く <ChevronRight className="h-3 w-3" />
            </div>
          )}
        </div>
        <ArrowUpRight
          className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-70"
          strokeWidth={2.2}
        />
      </div>
    </Link>
  );
}
