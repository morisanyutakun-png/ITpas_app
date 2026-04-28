import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Quote,
  Sparkle,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { getStudyLesson } from "@/server/queries/study";
import { getTopic, getTopicProgress } from "@/server/queries/topics";
import { StudyFigureView } from "@/components/study/Figure";
import type { StudyLesson } from "@/lib/contentSchema";

export const dynamic = "force-dynamic";

const MAJOR_META: Record<string, { hue: string; label: string }> = {
  strategy: { hue: "#FF375F", label: "Strategy" },
  management: { hue: "#FF9500", label: "Management" },
  technology: { hue: "#0A84FF", label: "Technology" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getStudyLesson(slug);
  return { title: lesson?.title ?? "Reading" };
}

/**
 * Lesson reader — reading is the protagonist.
 *
 * Layout choices that make the page feel like an editorial piece, not a
 * quiz funnel:
 *
 *   • Magazine "dek" small-caps line above the title.
 *   • Drop cap on the first paragraph (psychology: invites long-form reading).
 *   • Numbered section heads in muted gray, large serif body subheads.
 *   • Inline figures live *inside* the section that introduces them.
 *   • Callouts use three calm voices (insight / caution / aside).
 *   • Related-question handoff is a quiet section at the end labeled
 *     "Test what you read", not a hero CTA.
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
    ? MAJOR_META[topic.majorCategory] ?? { hue: "#8E8E93", label: "Topic" }
    : { hue: "#8E8E93", label: "Topic" };

  const ratePct =
    progress.attempted > 0 ? Math.round(progress.rate * 100) : null;

  return (
    <article className="mx-auto max-w-[680px] pb-16">
      {/* ── Breadcrumb ── */}
      <nav className="pt-1">
        <Link
          href="/learn/study"
          className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="uppercase tracking-[0.16em]">Reading Room</span>
        </Link>
      </nav>

      {/* ── Editorial header ─────────────────────────────────────────
         Dek (small caps) → display title → byline-style hook.
         No big colored card here — let typography carry the moment.
      */}
      <header className="mt-8 space-y-5">
        {lesson.dek && (
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span
              aria-hidden
              className="inline-block h-1 w-6 rounded-full"
              style={{ background: meta.hue }}
            />
            {lesson.dek}
          </div>
        )}
        <h1 className="font-serif text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-[48px]">
          {lesson.title}
        </h1>
        <p className="max-w-[58ch] text-[16px] leading-[1.7] text-muted-foreground text-pretty">
          {lesson.hook}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span style={{ color: meta.hue }}>{meta.label}</span>
          {topic?.minorTopic && (
            <span className="hidden sm:inline">· {topic.minorTopic}</span>
          )}
          <span className="ml-auto inline-flex items-center gap-3">
            <span>
              <span className="num font-semibold text-foreground">
                {lesson.readingMinutes}
              </span>{" "}
              min read
            </span>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span>
              <span className="num font-semibold text-foreground">
                {lesson.sections.length}
              </span>{" "}
              sections
            </span>
          </span>
        </div>
      </header>

      {/* ── Hero figure ── */}
      <div className="mt-8">
        <StudyFigureView figure={lesson.figure} />
      </div>

      {/* ── Long-form body ── */}
      <div className="mt-12 space-y-14">
        {lesson.sections.map((section, idx) => (
          <BodySection
            key={idx}
            index={idx + 1}
            heading={section.heading}
            paragraphs={section.paragraphs}
            figure={section.figure}
            callouts={section.callouts}
            isFirst={idx === 0}
          />
        ))}
      </div>

      {/* ── Reader's digest (takeaways) ── */}
      <section className="mt-16 border-t border-border pt-10">
        <SectionLabel index="—" label="Reader's Digest" />
        <h2 className="mt-3 font-serif text-[26px] font-semibold tracking-[-0.018em]">
          ひと息で読める要約
        </h2>
        <ul className="mt-6 space-y-4">
          {lesson.takeaways.map((kp, i) => (
            <li key={i} className="grid grid-cols-[28px_1fr] gap-4">
              <span
                className="num pt-0.5 text-[11.5px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: meta.hue }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="text-[15.5px] font-semibold tracking-tight">
                  {kp.term}
                </div>
                <div className="mt-0.5 text-[14px] leading-[1.7] text-muted-foreground text-pretty">
                  {kp.body}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Worked examples ── */}
      {lesson.examples.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <SectionLabel index="—" label="Worked Examples" />
          <h2 className="mt-3 font-serif text-[26px] font-semibold tracking-[-0.018em]">
            読みながら、軽く頭を使う
          </h2>
          <div className="mt-6 space-y-5">
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
    </article>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-baseline gap-3 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      <span className="num">{index}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
      <span>{label}</span>
    </div>
  );
}

function BodySection({
  index,
  heading,
  paragraphs,
  figure,
  callouts,
  isFirst,
}: {
  index: number;
  heading: string;
  paragraphs: string[];
  figure?: StudyLesson["sections"][number]["figure"];
  callouts: StudyLesson["sections"][number]["callouts"];
  isFirst: boolean;
}) {
  return (
    <section>
      <SectionLabel index={String(index).padStart(2, "0")} label="Chapter" />
      <h2 className="mt-3 font-serif text-[26px] font-semibold leading-[1.18] tracking-[-0.018em] text-balance sm:text-[30px]">
        {heading}
      </h2>
      <div className="mt-5 space-y-5">
        {paragraphs.map((p, i) => (
          <Paragraph key={i} text={p} dropCap={isFirst && i === 0} />
        ))}
      </div>
      {figure && (
        <div className="mt-8">
          <StudyFigureView figure={figure} />
        </div>
      )}
      {callouts.length > 0 && (
        <div className="mt-8 space-y-3">
          {callouts.map((c, i) => (
            <Callout
              key={i}
              kind={c.kind}
              title={c.title}
              body={c.body}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Renders a paragraph with `**bold**` and `\`code\`` parsed inline. We
 * roll our own micro-parser instead of pulling Markdown so the visual
 * stays consistent and authors can't introduce arbitrary formatting.
 */
function Paragraph({ text, dropCap }: { text: string; dropCap: boolean }) {
  const parts = renderInline(text);
  return (
    <p
      className={`text-[16.5px] leading-[1.85] text-foreground/90 text-pretty ${
        dropCap ? "first-letter-drop" : ""
      }`}
    >
      {parts}
    </p>
  );
}

function renderInline(text: string): React.ReactNode[] {
  // Tokenize on `**...**` and `` `...` ``.
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
          icon: <Sparkle className="h-4 w-4" />,
          label: "Insight",
        }
      : kind === "caution"
        ? {
            ring: "ring-[#FF9500]/25",
            bg: "bg-[#FF9500]/[0.06]",
            accent: "text-[#FF9500]",
            icon: <AlertTriangle className="h-4 w-4" />,
            label: "Watch out",
          }
        : {
            ring: "ring-border",
            bg: "bg-muted/60",
            accent: "text-muted-foreground",
            icon: <Info className="h-4 w-4" />,
            label: "Aside",
          };

  return (
    <aside
      className={`relative rounded-2xl ${conf.bg} p-5 ring-1 ring-inset ${conf.ring}`}
    >
      <div className={`flex items-center gap-2 ${conf.accent}`}>
        {conf.icon}
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em]">
          {title ?? conf.label}
        </span>
      </div>
      <p className="mt-2 text-[14.5px] leading-[1.75] text-foreground/90 text-pretty">
        {renderInline(body)}
      </p>
    </aside>
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
    <div className="rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3">
        <span
          className="num flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] font-semibold"
          style={{ background: `${hue}1A`, color: hue }}
        >
          {index}
        </span>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Example
        </div>
      </div>
      <p className="mt-3 flex gap-2 text-[15px] leading-[1.75] text-foreground/90">
        <Quote
          aria-hidden
          className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
        />
        <span>{renderInline(question)}</span>
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:pt-0.5">
          Answer
        </div>
        <div className="text-[14.5px] font-semibold tracking-tight">
          {answer}
        </div>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:pt-0.5">
          Why
        </div>
        <p className="text-[13.5px] leading-[1.75] text-muted-foreground text-pretty">
          {renderInline(reasoning)}
        </p>
      </div>
    </div>
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
    <section className="mt-16 border-t border-border pt-10">
      <SectionLabel index="—" label="Test What You Read" />
      <h2 className="mt-3 font-serif text-[26px] font-semibold tracking-[-0.018em]">
        読み終えたら、関連問題で復習
      </h2>
      <p className="mt-3 max-w-[56ch] text-[14px] leading-[1.75] text-muted-foreground text-pretty">
        理解の定着には、自分の言葉で答えを再構成する作業が要る。
        この章の論点をそのまま問う {lesson.questionCount} 問で、覚えたつもりを点検しよう。
        {ratePct !== null && (
          <>
            {" "}
            これまでの正答率は{" "}
            <span className="num font-semibold text-foreground">
              {ratePct}%
            </span>
            。
          </>
        )}
      </p>
      <Link
        href={`/learn/session/new?mode=topic&topic=${lesson.slug}&count=${lesson.questionCount}`}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-semibold text-white shadow-ios transition-transform hover:brightness-110 active:scale-[0.98]"
        style={{ background: hue }}
      >
        関連問題で復習する
        <ArrowUpRight className="h-4 w-4" />
      </Link>
      <div className="mt-4 inline-flex items-center gap-1 text-[12px] text-muted-foreground">
        <span>{lesson.questionCount} 問 · 約 {lesson.questionCount * 90 / 60 | 0}〜{Math.ceil(lesson.questionCount * 2.4)} 分</span>
        <ChevronRight className="h-3 w-3" />
      </div>
    </section>
  );
}
