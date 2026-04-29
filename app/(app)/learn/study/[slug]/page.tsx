import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Info,
  Lightbulb,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { getNextChapterWithLesson } from "@/server/queries/curriculum";
import { getStudyLesson } from "@/server/queries/study";
import { getTopic, getTopicProgress } from "@/server/queries/topics";
import { StudyFigureView } from "@/components/study/Figure";
import type { StudyLesson } from "@/lib/contentSchema";

export const dynamic = "force-dynamic";

const MAJOR_META: Record<string, { hue: string; label: string }> = {
  strategy: { hue: "#FF375F", label: "ストラテジ系" },
  management: { hue: "#FF9500", label: "マネジメント系" },
  technology: { hue: "#0A84FF", label: "テクノロジ系" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getStudyLesson(slug);
  return { title: lesson?.title ?? "学習" };
}

/**
 * Lesson reader — textbook-style. Reading is the protagonist, but the
 * page tone is a study platform: numbered "Step N" section badges, a
 * progress sidebar showing how far you've read, plenty of figures,
 * everyday-life analogies, and a mini self-check at the end of each
 * section so the reader commits in small bites before the formal quiz.
 */
export default async function StudyLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await readCurrentUser();
  const [lesson, topicData, progress] = await Promise.all([
    getStudyLesson(slug),
    getTopic(slug),
    getTopicProgress(slug, user?.id ?? null),
  ]);
  if (!lesson) notFound();

  const topic = topicData?.topic ?? null;
  const meta = topic
    ? MAJOR_META[topic.majorCategory] ?? { hue: "#8E8E93", label: "論点" }
    : { hue: "#8E8E93", label: "論点" };

  const ratePct =
    progress.attempted > 0 ? Math.round(progress.rate * 100) : null;

  // Next chapter handoff: only meaningful if we know the major.
  const nextChapter = topic
    ? await getNextChapterWithLesson(topic.majorCategory, slug)
    : null;
  const curriculumHref = topic
    ? `/curriculum/${topic.majorCategory}`
    : "/learn/study";

  return (
    <div className="mx-auto max-w-[720px] pb-16">
      {/* ── Breadcrumb ── */}
      <nav className="pt-1">
        <Link
          href={curriculumHref}
          className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {topic ? `${MAJOR_META[topic.majorCategory]?.label ?? "カリキュラム"} に戻る` : "学習一覧へ戻る"}
        </Link>
      </nav>

      {/* ── Lesson header (textbook style) ──────────────────────────
         Big colored badge for the major + plain (sans) title. Drop
         caps, serif display, eyebrow flourishes — all gone. */}
      <header className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{
              background: `${meta.hue}14`,
              color: meta.hue,
            }}
          >
            {meta.label}
          </span>
          {topic?.minorTopic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
              {topic.minorTopic}
            </span>
          )}
          {lesson.dek && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              {lesson.dek}
            </span>
          )}
        </div>
        <h1 className="text-[28px] font-semibold leading-[1.18] tracking-tight text-balance sm:text-[32px]">
          {lesson.title}
        </h1>
        <p className="max-w-[60ch] rounded-2xl bg-muted/50 px-5 py-4 text-[14px] leading-[1.85] text-foreground/90 text-pretty">
          {lesson.hook}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            読了の目安{" "}
            <span className="num font-semibold text-foreground">
              {lesson.readingMinutes}
            </span>{" "}
            分
          </span>
          <span aria-hidden className="text-border">
            ·
          </span>
          <span>
            全{" "}
            <span className="num font-semibold text-foreground">
              {lesson.sections.length}
            </span>{" "}
            ステップ
          </span>
          <span aria-hidden className="text-border">
            ·
          </span>
          <span>
            最後に関連問題{" "}
            <span className="num font-semibold text-foreground">
              {lesson.questionCount}
            </span>{" "}
            問
          </span>
        </div>
      </header>

      {/* ── Hero figure ── */}
      <div className="mt-7">
        <StudyFigureView figure={lesson.figure} />
      </div>

      {/* ── Steps (= sections) ── */}
      <div className="mt-12 space-y-12">
        {lesson.sections.map((section, idx) => (
          <BodySection
            key={idx}
            stepIndex={idx + 1}
            stepCount={lesson.sections.length}
            section={section}
            hue={meta.hue}
          />
        ))}
      </div>

      {/* ── Summary / takeaways ── */}
      <section className="mt-14 rounded-3xl bg-muted/40 p-6 ring-1 ring-inset ring-border sm:p-8">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          まとめ
        </div>
        <h2 className="mt-2 text-[20px] font-semibold tracking-tight">
          ひと息で読み返せる要約
        </h2>
        <ul className="mt-5 space-y-3.5">
          {lesson.takeaways.map((kp, i) => (
            <li key={i} className="grid grid-cols-[28px_1fr] gap-3">
              <span
                className="num flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold"
                style={{ background: `${meta.hue}14`, color: meta.hue }}
              >
                {i + 1}
              </span>
              <div>
                <div className="text-[14.5px] font-semibold tracking-tight">
                  {kp.term}
                </div>
                <div className="mt-0.5 text-[13.5px] leading-[1.75] text-muted-foreground text-pretty">
                  {kp.body}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Worked examples ── */}
      {lesson.examples.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" />
            例題で頭を温める
          </div>
          <h2 className="mt-2 text-[20px] font-semibold tracking-tight">
            読みながら、軽く頭を使う
          </h2>
          <div className="mt-5 space-y-4">
            {lesson.examples.map((ex, i) => (
              <WorkedExample
                key={i}
                index={i + 1}
                question={ex.question}
                answer={ex.answer}
                reasoning={ex.reasoning}
                hue={meta.hue}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Quiet revision handoff ── */}
      <RevisionHandoff lesson={lesson} ratePct={ratePct} hue={meta.hue} />

      {/* ── Next chapter / curriculum handoff ── */}
      <NextChapter
        nextChapter={nextChapter}
        curriculumHref={curriculumHref}
        majorLabel={topic ? MAJOR_META[topic.majorCategory]?.label ?? null : null}
        hue={meta.hue}
      />
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────

function BodySection({
  stepIndex,
  stepCount,
  section,
  hue,
}: {
  stepIndex: number;
  stepCount: number;
  section: StudyLesson["sections"][number];
  hue: string;
}) {
  return (
    <section>
      {/* Color-coded "Step N of M" badge — the platform feel. */}
      <div className="flex items-center gap-3">
        <span
          className="num flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white shadow-tile"
          style={{ background: hue }}
        >
          {stepIndex}
        </span>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Step {stepIndex} / {stepCount}
        </div>
      </div>

      <h2 className="mt-3 text-[22px] font-semibold leading-[1.32] tracking-tight text-balance sm:text-[24px]">
        {section.heading}
      </h2>

      {section.summary && (
        <p className="mt-2 text-[13px] leading-[1.7] text-muted-foreground text-pretty">
          {section.summary}
        </p>
      )}

      {/* Analogy block — comes BEFORE prose, anchors abstract idea. */}
      {section.analogy && (
        <Analogy label={section.analogy.label} body={section.analogy.body} />
      )}

      <div className="mt-5 space-y-4">
        {section.paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-[15px] leading-[1.92] text-foreground/90 text-pretty"
          >
            {renderInline(p)}
          </p>
        ))}
      </div>

      {section.figure && (
        <div className="mt-7">
          <StudyFigureView figure={section.figure} />
        </div>
      )}

      {section.callouts.length > 0 && (
        <div className="mt-7 space-y-3">
          {section.callouts.map((c, i) => (
            <Callout
              key={i}
              kind={c.kind}
              title={c.title}
              body={c.body}
            />
          ))}
        </div>
      )}

      {section.miniQuiz && (
        <MiniQuiz
          question={section.miniQuiz.question}
          answer={section.miniQuiz.answer}
          hint={section.miniQuiz.hint}
          hue={hue}
        />
      )}
    </section>
  );
}

function Analogy({ label, body }: { label: string; body: string }) {
  return (
    <aside className="mt-5 grid grid-cols-[40px_1fr] gap-3 rounded-2xl bg-[#34C759]/[0.08] p-4 ring-1 ring-inset ring-[#34C759]/20">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#34C759] text-white shadow-tile">
        <Lightbulb className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <div>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#34C759]">
          {label}
        </div>
        <p className="mt-1 text-[14px] leading-[1.85] text-foreground/90 text-pretty">
          {renderInline(body)}
        </p>
      </div>
    </aside>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) {
      tokens.push(
        <strong key={key++} className="font-semibold text-foreground">
          {t.slice(2, -2)}
        </strong>
      );
    } else {
      tokens.push(
        <code
          key={key++}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.92em]"
        >
          {t.slice(1, -1)}
        </code>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return tokens;
}

function Callout({
  kind,
  title,
  body,
}: {
  kind: "insight" | "caution" | "aside";
  title?: string;
  body: string;
}) {
  const conf =
    kind === "insight"
      ? {
          ring: "ring-[#0A84FF]/25",
          bg: "bg-[#0A84FF]/[0.06]",
          accent: "text-[#0A84FF]",
          icon: <Sparkles className="h-4 w-4" />,
          label: "ポイント",
        }
      : kind === "caution"
        ? {
            ring: "ring-[#FF9500]/25",
            bg: "bg-[#FF9500]/[0.08]",
            accent: "text-[#FF9500]",
            icon: <AlertTriangle className="h-4 w-4" />,
            label: "注意",
          }
        : {
            ring: "ring-border",
            bg: "bg-muted/60",
            accent: "text-muted-foreground",
            icon: <Info className="h-4 w-4" />,
            label: "補足",
          };

  return (
    <aside
      className={`relative rounded-2xl ${conf.bg} p-5 ring-1 ring-inset ${conf.ring}`}
    >
      <div className={`flex items-center gap-2 ${conf.accent}`}>
        {conf.icon}
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]">
          {title ?? conf.label}
        </span>
      </div>
      <p className="mt-2 text-[14px] leading-[1.85] text-foreground/90 text-pretty">
        {renderInline(body)}
      </p>
    </aside>
  );
}

/**
 * Inline self-check at the end of a section. Renders as a `<details>` so
 * the answer is hidden by default — the reader commits to thinking
 * before seeing the answer (psychological "active recall").
 */
function MiniQuiz({
  question,
  answer,
  hint,
  hue,
}: {
  question: string;
  answer: string;
  hint?: string;
  hue: string;
}) {
  return (
    <details className="group mt-7 rounded-2xl border border-dashed border-border bg-card p-5">
      <summary className="flex cursor-pointer items-start gap-3 list-none [&::-webkit-details-marker]:hidden">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white shadow-tile"
          style={{ background: hue }}
        >
          ?
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            理解の確認
          </div>
          <div className="mt-0.5 text-[14.5px] font-semibold tracking-tight">
            {question}
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground group-open:hidden">
            タップして答えを見る ↓
          </div>
        </div>
      </summary>
      <div className="mt-3 space-y-2 border-t border-dashed border-border pt-3">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: hue }}
          >
            答え
          </span>
          <span className="text-[14px] font-semibold">{answer}</span>
        </div>
        {hint && (
          <p className="text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
            {hint}
          </p>
        )}
      </div>
    </details>
  );
}

function WorkedExample({
  index,
  question,
  answer,
  reasoning,
  hue,
}: {
  index: number;
  question: string;
  answer: string;
  reasoning: string;
  hue: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span
          className="num flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] font-semibold"
          style={{ background: `${hue}14`, color: hue }}
        >
          {index}
        </span>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          例題 {index}
        </div>
      </div>
      <p className="mt-3 text-[14.5px] leading-[1.8] text-foreground/90">
        {renderInline(question)}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:pt-0.5">
          答え
        </div>
        <div className="text-[14px] font-semibold tracking-tight">
          {answer}
        </div>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:pt-0.5">
          解説
        </div>
        <p className="text-[13px] leading-[1.8] text-muted-foreground text-pretty">
          {renderInline(reasoning)}
        </p>
      </div>
    </div>
  );
}

function NextChapter({
  nextChapter,
  curriculumHref,
  majorLabel,
  hue,
}: {
  nextChapter: { slug: string; title: string } | null;
  curriculumHref: string;
  majorLabel: string | null;
  hue: string;
}) {
  return (
    <section className="mt-8 grid gap-3 sm:grid-cols-2">
      {nextChapter && (
        <Link
          href={`/learn/study/${nextChapter.slug}`}
          className="surface-card group flex items-start gap-4 p-5"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-tile"
            style={{ background: hue }}
          >
            <ArrowRight className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <div
              className="text-[10.5px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: hue }}
            >
              次の章へ進む
            </div>
            <div className="mt-0.5 line-clamp-2 text-[15px] font-semibold tracking-tight">
              {nextChapter.title}
            </div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              続けて読むと定着が早い
            </div>
          </div>
        </Link>
      )}
      <Link
        href={curriculumHref}
        className="surface-card flex items-start gap-4 p-5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <BookOpen className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            カリキュラムに戻る
          </div>
          <div className="mt-0.5 text-[15px] font-semibold tracking-tight">
            {majorLabel ?? "カリキュラム"}の章一覧
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            進捗を確認して次の章を選ぶ
          </div>
        </div>
        <ChevronLeft className="h-4 w-4 shrink-0 self-center text-muted-foreground" />
      </Link>
    </section>
  );
}

function RevisionHandoff({
  lesson,
  ratePct,
  hue,
}: {
  lesson: StudyLesson;
  ratePct: number | null;
  hue: string;
}) {
  return (
    <section className="mt-14 overflow-hidden rounded-3xl bg-foreground text-background">
      <div className="p-7 sm:p-8">
        <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] opacity-70">
          <PlayCircle className="h-3.5 w-3.5" />
          理解の定着
        </div>
        <h2 className="mt-2 text-[22px] font-semibold leading-tight tracking-tight">
          読み終えたら、関連問題で復習
        </h2>
        <p className="mt-2 max-w-[56ch] text-[13.5px] leading-[1.85] opacity-85 text-pretty">
          理解の定着には、自分の言葉で答えを再構成する作業が必要です。
          この章の論点をそのまま問う <span className="num font-semibold">{lesson.questionCount}</span> 問で、覚えたつもりを点検しましょう。
          {ratePct !== null && (
            <>
              {" "}
              これまでの正答率は{" "}
              <span className="num font-semibold">{ratePct}%</span> です。
            </>
          )}
        </p>
        <Link
          href={`/learn/session/new?mode=topic&topic=${lesson.slug}&count=${lesson.questionCount}`}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-semibold text-white shadow-ios transition-transform hover:brightness-110 active:scale-[0.98]"
          style={{ background: hue }}
        >
          関連問題で復習する
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
