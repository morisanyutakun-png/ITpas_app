import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  Network,
  PlayCircle,
  Target,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { getTopic, getTopicProgress } from "@/server/queries/topics";
import { Markdown } from "@/lib/markdown";
import { AccuracyRing } from "@/components/home/AccuracyRing";

export const dynamic = "force-dynamic";

const MAJOR_META: Record<
  string,
  { label: string; hue: string; hueDim: string }
> = {
  strategy: {
    label: "STRATEGY",
    hue: "#FF375F",
    hueDim: "rgba(255,55,95,0.14)",
  },
  management: {
    label: "MANAGEMENT",
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.14)",
  },
  technology: {
    label: "TECHNOLOGY",
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.14)",
  },
};

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await readCurrentUser();
  const [data, progress] = await Promise.all([
    getTopic(slug),
    getTopicProgress(slug, user?.id ?? null),
  ]);
  if (!data) notFound();
  const { topic, materials, questions } = data;
  const meta = MAJOR_META[topic.majorCategory] ?? {
    label: topic.majorCategory.toUpperCase(),
    hue: "#8E8E93",
    hueDim: "rgba(142,142,147,0.14)",
  };
  const questionCount = questions.length;
  const ratePct =
    progress.attempted > 0 ? Math.round(progress.rate * 100) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {/* ── Breadcrumb ── */}
      <Link
        href="/topics"
        className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground active:opacity-70"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="kicker !mt-0">Topic Map</span>
      </Link>

      {/* ── Editorial hero (light, designed — not a gradient wall) ── */}
      <header className="editorial-card relative overflow-hidden p-6 sm:p-7">
        <div
          aria-hidden
          className="album-glyph pointer-events-none absolute right-[-4%] top-[-12%] text-[170px] leading-none opacity-[0.08]"
          style={{ color: meta.hue }}
        >
          {topic.majorCategory[0].toUpperCase()}
        </div>

        <div className="relative z-10 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em]">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                style={{ background: meta.hueDim, color: meta.hue }}
              >
                {meta.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                {topic.minorTopic}
              </span>
              {questionCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                  <Layers className="h-3 w-3" />
                  {questionCount}問
                </span>
              )}
            </div>
            <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight text-balance sm:text-[32px]">
              {topic.title}
            </h1>
            {topic.summary && (
              <p className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground text-pretty">
                {topic.summary}
              </p>
            )}
          </div>

          {/* Progress ring (right) */}
          {user?.isSignedIn && (
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <AccuracyRing
                percent={ratePct}
                size={84}
                thickness={7}
                label={ratePct === null ? "UNSTARTED" : "YOUR ACCURACY"}
              />
              {progress.attempted > 0 && (
                <div className="text-right text-[11px] text-muted-foreground">
                  <span className="num font-semibold text-foreground">
                    {progress.correct}
                  </span>
                  {" / "}
                  <span className="num">{progress.attempted}</span> 問
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTAs */}
        {questionCount > 0 && (
          <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
            <Link
              href={`/learn/session/new?mode=topic&topic=${topic.slug}&count=5`}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background shadow-ios active:opacity-90"
            >
              <PlayCircle className="h-4 w-4" />
              この論点で5問
            </Link>
            <Link
              href={`/learn/session/new?mode=topic&topic=${topic.slug}&count=10`}
              className="inline-flex h-11 items-center gap-1 rounded-full bg-muted px-4 text-[13px] font-semibold text-foreground active:opacity-80"
            >
              10問に増やす
            </Link>
          </div>
        )}
      </header>

      {/* ── Study note ── */}
      {topic.body && (
        <section className="space-y-3">
          <div className="rule-label">Study Note</div>
          <article className="surface-card relative overflow-hidden p-6 md:p-8">
            <div
              aria-hidden
              className="absolute inset-y-3 left-0 w-1 rounded-r-full"
              style={{ background: meta.hue }}
            />
            <div className="prose prose-sm max-w-none pl-3 text-[15.5px] leading-[1.85] prose-headings:tracking-tight prose-headings:font-semibold">
              <Markdown>{topic.body}</Markdown>
            </div>
          </article>
        </section>
      )}

      {/* ── Related materials ── */}
      {materials.length > 0 && (
        <section className="space-y-3">
          <div className="rule-label">Related Materials</div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {materials.map((m) => (
              <Link
                key={m.slug}
                href={`/materials/${m.slug}`}
                className="group surface-card flex items-start gap-3 p-4 transition-transform active:scale-[0.99]"
              >
                <span
                  className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: meta.hueDim, color: meta.hue }}
                >
                  <BookOpen className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: meta.hue }}
                  >
                    {m.type === "term_compare"
                      ? "TERM TABLE"
                      : m.type === "diagram"
                      ? "DIAGRAM"
                      : m.type === "cheatsheet"
                      ? "CHEATSHEET"
                      : "NOTE"}
                  </div>
                  <div className="truncate text-[14.5px] font-semibold">
                    {m.title}
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Related questions (preview count) ── */}
      {questionCount > 0 && (
        <section className="space-y-3">
          <div className="rule-label">Questions · Preview</div>
          <div className="surface-card divide-y divide-border overflow-hidden">
            {questions.slice(0, 6).map((q) => (
              <Link
                key={q.id}
                href={`/learn/questions/${q.id}`}
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: meta.hueDim, color: meta.hue }}
                >
                  <Target className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="num text-[10.5px] font-medium text-muted-foreground">
                    R{q.examYear} · 問{q.questionNumber}
                  </div>
                  <div className="line-clamp-1 text-[13.5px]">{q.stem}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
            {questionCount > 6 && (
              <Link
                href={`/learn/session/new?mode=topic&topic=${topic.slug}&count=10`}
                className="flex items-center justify-center gap-1 py-3 text-[12.5px] font-semibold text-muted-foreground active:opacity-70"
              >
                あと {questionCount - 6} 問を解く
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── Related — misc links row ── */}
      <section className="grid gap-2.5 sm:grid-cols-2">
        <Link
          href={`/learn/session/new?mode=topic&topic=${topic.slug}&count=5`}
          className="surface-card flex items-center gap-3 p-4 transition-transform active:scale-[0.99]"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-tile"
            style={{ background: meta.hue }}
          >
            <Network className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Sharpen
            </div>
            <div className="text-[14.5px] font-semibold">5問セッションに入る</div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link
          href="/topics"
          className="surface-card flex items-center gap-3 p-4 transition-transform active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Topic Map
            </div>
            <div className="text-[14.5px] font-semibold">論点マップへ戻る</div>
          </div>
        </Link>
      </section>
    </div>
  );
}
