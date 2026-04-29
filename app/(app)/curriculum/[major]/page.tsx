import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import {
  getCurriculum,
  type CurriculumChapter,
} from "@/server/queries/curriculum";

export const dynamic = "force-dynamic";

const VALID = new Set(["strategy", "management", "technology"] as const);
type Major = "strategy" | "management" | "technology";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ major: string }>;
}) {
  const { major } = await params;
  const titles: Record<string, string> = {
    strategy: "ストラテジ系のカリキュラム",
    management: "マネジメント系のカリキュラム",
    technology: "テクノロジ系のカリキュラム",
  };
  return { title: titles[major] ?? "カリキュラム" };
}

const STATUS_META = {
  unstarted: {
    label: "未着手",
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
  learning: {
    label: "学習中",
    bg: "bg-[#FF9500]/14",
    text: "text-[#FF9500]",
  },
  settled: {
    label: "定着",
    bg: "bg-[#0A84FF]/14",
    text: "text-[#0A84FF]",
  },
  mastered: {
    label: "習熟",
    bg: "bg-[#34C759]/14",
    text: "text-[#34C759]",
  },
} as const;

/**
 * /curriculum/[major] — Apple Music style "syllabus chapter list".
 *
 * Each minor topic is a section; under it, every chapter (= topic) is a
 * row that shows lesson availability + the user's progress, and offers
 * two clear actions: 「読む」 (open the article) and 「練習」 (start a 5-question
 * session). The point of this page is to make the curriculum feel like an
 * actual course, not a content dump.
 */
export default async function CurriculumPage({
  params,
}: {
  params: Promise<{ major: string }>;
}) {
  const { major: majorRaw } = await params;
  if (!VALID.has(majorRaw as Major)) notFound();
  const major = majorRaw as Major;
  const user = await readCurrentUser();
  const curr = await getCurriculum(major, user?.id ?? null);

  const masteryPct =
    curr.totalChapters > 0
      ? Math.round((curr.masteredChapters / curr.totalChapters) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-[760px] space-y-8 pb-12">
      {/* ── Breadcrumb ── */}
      <nav className="pt-1">
        <Link
          href="/home"
          className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          ホームに戻る
        </Link>
      </nav>

      {/* ── Header ── */}
      <header
        className="relative overflow-hidden rounded-3xl p-6 text-white sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${curr.hue} 0%, rgba(0,0,0,0.4) 100%), ${curr.hue}`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.20), transparent 55%), radial-gradient(100% 80% at 0% 100%, rgba(0,0,0,0.30), transparent 50%)",
          }}
        />
        <div className="relative space-y-3">
          <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] opacity-85">
            <BookOpen className="h-3.5 w-3.5" />
            カリキュラム
          </div>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-balance sm:text-[32px]">
            {curr.label}
          </h1>
          <p className="max-w-[58ch] text-[13.5px] leading-[1.85] opacity-90 text-pretty">
            {curr.intro}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-[12px] opacity-90">
            <span>
              中項目{" "}
              <span className="num font-semibold">{curr.minors.length}</span>
            </span>
            <span aria-hidden className="opacity-50">
              ·
            </span>
            <span>
              論点{" "}
              <span className="num font-semibold">{curr.totalChapters}</span>
            </span>
            <span aria-hidden className="opacity-50">
              ·
            </span>
            <span>
              記事あり{" "}
              <span className="num font-semibold">{curr.withLessonCount}</span>
            </span>
            <span aria-hidden className="opacity-50">
              ·
            </span>
            <span>
              習熟{" "}
              <span className="num font-semibold">{masteryPct}%</span>
            </span>
          </div>
          {curr.totalChapters > 0 && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: `${Math.max(2, masteryPct)}%`,
                }}
              />
            </div>
          )}
        </div>
      </header>

      {/* ── Minor sections ── */}
      <div className="space-y-10">
        {curr.minors.map((minor, idx) => (
          <section key={minor.minorTopic} className="space-y-3">
            <div className="flex items-end justify-between gap-3 px-1">
              <div className="min-w-0">
                <div
                  className="num text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: curr.hue }}
                >
                  Chapter {String(idx + 1).padStart(2, "0")}
                </div>
                <h2 className="mt-1 text-[18px] font-semibold tracking-tight sm:text-[20px]">
                  {minor.minorTopic}
                </h2>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  論点 {minor.chapters.length} ・ 記事あり{" "}
                  {minor.withLessonCount} ・ 習熟 {minor.masteredCount}
                </p>
              </div>
            </div>
            <ol className="surface-card divide-y divide-border overflow-hidden">
              {minor.chapters.map((ch, chIdx) => (
                <ChapterRow
                  key={ch.slug}
                  chapter={ch}
                  index={chIdx + 1}
                  hue={curr.hue}
                />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

// ── Subcomponents ───────────────────────────────────────────────────────

function ChapterRow({
  chapter,
  index,
  hue,
}: {
  chapter: CurriculumChapter;
  index: number;
  hue: string;
}) {
  const status = STATUS_META[chapter.status];
  const ratePct =
    chapter.attempted > 0
      ? Math.round(chapter.correctRate * 100)
      : null;

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      {/* Index badge */}
      <span
        className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
        style={{ background: `${hue}14`, color: hue }}
      >
        {String(index).padStart(2, "0")}
      </span>

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold tracking-tight">
            {chapter.title}
          </h3>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${status.bg} ${status.text}`}
          >
            {chapter.status === "mastered" && <Check className="h-3 w-3" />}
            {status.label}
          </span>
          {chapter.hasLesson && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0A84FF]/12 px-2 py-0.5 text-[10.5px] font-semibold text-[#0A84FF]">
              <Sparkles className="h-3 w-3" />
              記事あり
            </span>
          )}
        </div>
        {chapter.summary && (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
            {chapter.summary}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
          <span>
            関連問題{" "}
            <span className="num font-semibold text-foreground">
              {chapter.questionCount}
            </span>{" "}
            問
          </span>
          {ratePct !== null && (
            <>
              <span aria-hidden className="text-border">
                ·
              </span>
              <span>
                正答率{" "}
                <span className="num font-semibold text-foreground">
                  {ratePct}%
                </span>{" "}
                ({chapter.attempted}問)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-stretch gap-2">
        {chapter.hasLesson ? (
          <Link
            href={`/learn/study/${chapter.slug}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[12.5px] font-semibold text-background shadow-ios hover:brightness-110 active:scale-[0.97]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            読む
          </Link>
        ) : (
          <span
            aria-disabled
            className="inline-flex h-10 cursor-not-allowed items-center gap-1.5 rounded-full bg-muted px-4 text-[12.5px] font-semibold text-muted-foreground"
            title="この論点の記事は準備中です"
          >
            <Lock className="h-3.5 w-3.5" />
            記事準備中
          </span>
        )}
        {chapter.questionCount > 0 ? (
          <Link
            href={`/learn/session/new?mode=topic&topic=${chapter.slug}&count=5`}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-muted px-4 text-[12.5px] font-semibold text-foreground hover:bg-muted/70 active:scale-[0.97]"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            5問で練習
          </Link>
        ) : (
          <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-muted px-4 text-[12.5px] font-semibold text-muted-foreground/70">
            <Target className="h-3.5 w-3.5" />
            問題なし
          </span>
        )}
        <ChevronRight
          aria-hidden
          className="hidden h-4 w-4 self-center text-muted-foreground sm:block"
        />
      </div>
    </li>
  );
}
