import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { listStudyLessonSlugs, getStudyLesson } from "@/server/queries/study";
import { listTopics } from "@/server/queries/topics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reading Room" };

const MAJOR_META: Record<string, { hue: string; label: string }> = {
  strategy: { hue: "#FF375F", label: "Strategy" },
  management: { hue: "#FF9500", label: "Management" },
  technology: { hue: "#0A84FF", label: "Technology" },
};

/**
 * Reading Room — index of full essays. Listed as a magazine table of
 * contents rather than a card grid; the visual decision invites the
 * reader to commit to a piece, not to scan tiles.
 */
export default async function StudyIndexPage() {
  const slugs = await listStudyLessonSlugs();
  const [lessons, allTopics] = await Promise.all([
    Promise.all(slugs.map((s) => getStudyLesson(s))),
    listTopics(),
  ]);
  const topicBySlug = new Map(allTopics.map((t) => [t.slug, t]));

  const items = lessons
    .filter(
      (l): l is NonNullable<typeof l> => l !== null && topicBySlug.has(l.slug)
    )
    .map((l) => ({ lesson: l, topic: topicBySlug.get(l.slug)! }));

  return (
    <div className="mx-auto max-w-[760px] space-y-12 pb-16">
      {/* ── Editorial header ── */}
      <header className="space-y-3 pt-1">
        <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <span aria-hidden className="inline-block h-1 w-6 rounded-full bg-foreground/70" />
          Reading Room
        </div>
        <h1 className="font-serif text-[40px] font-semibold leading-[1.06] tracking-[-0.022em] text-balance sm:text-[48px]">
          読んで、納得して、
          <br className="hidden sm:inline" />
          そして問題で確かめる。
        </h1>
        <p className="max-w-[58ch] text-[15px] leading-[1.75] text-muted-foreground text-pretty">
          ITパスポートの主要論点を、ブログ記事の濃度で。
          ひとつの章は 4〜6 分で読み切れる長さに整えてあります。
          読み終えたら、その場で関連問題に進んで定着を確かめましょう。
        </p>
      </header>

      {items.length === 0 ? (
        <div className="surface-card p-6 text-center text-[13px] text-muted-foreground">
          記事を準備中です。
        </div>
      ) : (
        <ol className="divide-y divide-border border-y border-border">
          {items.map(({ lesson, topic }, idx) => {
            const meta = MAJOR_META[topic.majorCategory] ?? {
              hue: "#8E8E93",
              label: "Topic",
            };
            return (
              <li key={lesson.slug}>
                <Link
                  href={`/learn/study/${lesson.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-start gap-5 py-7 transition-colors hover:bg-muted/30"
                >
                  <div className="num pt-1 text-[12px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] font-semibold uppercase tracking-[0.18em]">
                      <span style={{ color: meta.hue }}>{meta.label}</span>
                      <span className="text-muted-foreground/80">
                        · {topic.minorTopic}
                      </span>
                      {lesson.dek && (
                        <span className="text-muted-foreground/60">
                          · {lesson.dek}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 font-serif text-[24px] font-semibold leading-[1.18] tracking-[-0.018em] text-balance sm:text-[28px]">
                      {lesson.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 max-w-[58ch] text-[14px] leading-[1.75] text-muted-foreground text-pretty">
                      {lesson.hook}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span className="num">{lesson.readingMinutes}</span> min read
                      </span>
                      <span aria-hidden className="text-border">
                        ·
                      </span>
                      <span>
                        <span className="num">{lesson.questionCount}</span> revision questions
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="mt-2 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
