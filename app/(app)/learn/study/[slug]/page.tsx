import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  Clock,
  PlayCircle,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { getStudyLesson } from "@/server/queries/study";
import { getTopic, getTopicProgress } from "@/server/queries/topics";
import { StudyFigureView } from "@/components/study/Figure";

export const dynamic = "force-dynamic";

const MAJOR_META: Record<string, { hue: string; label: string }> = {
  strategy: { hue: "#FF375F", label: "STRATEGY" },
  management: { hue: "#FF9500", label: "MANAGEMENT" },
  technology: { hue: "#0A84FF", label: "TECHNOLOGY" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getStudyLesson(slug);
  return { title: lesson?.title ?? "学習モード" };
}

/**
 * Input page — "授業資料" reader. Renders a typed figure plus a tight set
 * of takeaways and pitfalls, then hands off directly to the matching
 * 5-question session. The page is intentionally short: 60 seconds in,
 * straight into output.
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
    ? MAJOR_META[topic.majorCategory] ?? { hue: "#8E8E93", label: "TOPIC" }
    : { hue: "#8E8E93", label: "TOPIC" };

  const ratePct =
    progress.attempted > 0 ? Math.round(progress.rate * 100) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {/* ── Breadcrumb ── */}
      <Link
        href="/learn/study"
        className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        学習モード
      </Link>

      {/* ── Heading ── */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em]">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: `${meta.hue}1A`,
              color: meta.hue,
            }}
          >
            {meta.label}
          </span>
          {topic?.minorTopic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
              {topic.minorTopic}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {Math.round(lesson.estimatedSeconds / 10) * 10}秒で読む
          </span>
        </div>
        <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight text-balance sm:text-[32px]">
          {lesson.title}
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground text-pretty">
          {lesson.hook}
        </p>
      </header>

      {/* ── Figure ── */}
      <StudyFigureView figure={lesson.figure} />

      {/* ── Key points ── */}
      <section className="space-y-2.5">
        <div className="rule-label">Key Points</div>
        <ul className="surface-card divide-y divide-border/60 overflow-hidden">
          {lesson.keyPoints.map((kp, i) => (
            <li key={i} className="flex gap-4 px-5 py-4">
              <span
                className="num shrink-0 text-[12px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: meta.hue }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14.5px] font-semibold tracking-tight">
                  {kp.term}
                </div>
                <div className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground text-pretty">
                  {kp.body}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Pitfalls ── */}
      {lesson.pitfalls.length > 0 && (
        <section className="space-y-2.5">
          <div className="rule-label">試験で間違えやすいポイント</div>
          <ul className="space-y-2">
            {lesson.pitfalls.map((p, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl bg-[#FF9500]/8 p-3.5 text-[13px] leading-relaxed ring-1 ring-inset ring-[#FF9500]/20"
              >
                <AlertTriangle
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#FF9500]"
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Output handoff ── */}
      <section className="rounded-3xl bg-foreground p-6 text-background sm:p-7">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] opacity-70">
          Output · 試す
        </div>
        <div className="mt-1 text-[20px] font-semibold leading-tight tracking-tight">
          読んだら、その場で {lesson.questionCount} 問。
        </div>
        <p className="mt-1 max-w-md text-[12.5px] leading-relaxed opacity-80">
          覚えたつもりを、出題で確かめます。
          {ratePct !== null && (
            <>
              {" "}
              いまの正答率は <span className="num font-semibold">{ratePct}%</span>。
            </>
          )}
        </p>
        <Link
          href={`/learn/session/new?mode=topic&topic=${lesson.slug}&count=${lesson.questionCount}`}
          className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-full bg-background px-5 text-[14px] font-semibold text-foreground shadow-ios hover:brightness-110 active:opacity-90"
        >
          <PlayCircle className="h-4 w-4" />
          {lesson.questionCount}問のセッションを開始
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  );
}
