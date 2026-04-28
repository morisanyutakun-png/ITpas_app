import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, Clock } from "lucide-react";
import { listStudyLessonSlugs, getStudyLesson } from "@/server/queries/study";
import { listTopics } from "@/server/queries/topics";

export const dynamic = "force-dynamic";
export const metadata = { title: "学習モード" };

const MAJOR_META: Record<string, { hue: string; label: string }> = {
  strategy: { hue: "#FF375F", label: "STRATEGY" },
  management: { hue: "#FF9500", label: "MANAGEMENT" },
  technology: { hue: "#0A84FF", label: "TECHNOLOGY" },
};

/**
 * Index of lesson-ready topics. Lists only topics that have a study JSON
 * file — avoids the "click into nothing" problem until lessons are
 * authored.
 */
export default async function StudyIndexPage() {
  const slugs = await listStudyLessonSlugs();
  const [lessons, allTopics] = await Promise.all([
    Promise.all(slugs.map((s) => getStudyLesson(s))),
    listTopics(),
  ]);
  const topicBySlug = new Map(allTopics.map((t) => [t.slug, t]));

  // Pair each lesson with its topic; drop lessons whose topic isn't seeded.
  const items = lessons
    .filter(
      (l): l is NonNullable<typeof l> => l !== null && topicBySlug.has(l.slug)
    )
    .map((l) => ({ lesson: l, topic: topicBySlug.get(l.slug)! }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <header className="space-y-2 pt-1">
        <div className="kicker">Input · Study</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          学習モード
        </h1>
        <p className="max-w-xl text-[13.5px] text-muted-foreground text-pretty">
          授業資料のように、図解と要点だけ。1論点あたり 60 秒で読み、その場で 5 問。
        </p>
      </header>

      {items.length === 0 ? (
        <div className="surface-card p-6 text-center text-[13px] text-muted-foreground">
          学習レッスンを準備中です。
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(({ lesson, topic }) => {
            const meta = MAJOR_META[topic.majorCategory] ?? {
              hue: "#8E8E93",
              label: "TOPIC",
            };
            return (
              <li key={lesson.slug}>
                <Link
                  href={`/learn/study/${lesson.slug}`}
                  className="surface-card group flex items-start gap-4 p-5"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-tile"
                    style={{ background: meta.hue }}
                  >
                    <BookOpen className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em]">
                      <span style={{ color: meta.hue }}>{meta.label}</span>
                      <span className="text-muted-foreground">
                        · {topic.minorTopic}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[16px] font-semibold tracking-tight">
                      {lesson.title}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
                      {lesson.hook}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.round(lesson.estimatedSeconds / 10) * 10}秒
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        {lesson.questionCount}問の演習へ
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
