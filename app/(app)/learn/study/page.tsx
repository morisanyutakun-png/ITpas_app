import Link from "next/link";
import { BookOpen, ChevronRight, Clock } from "lucide-react";
import { listStudyLessonSlugs, getStudyLesson } from "@/server/queries/study";
import { listTopics } from "@/server/queries/topics";

export const dynamic = "force-dynamic";
export const metadata = { title: "学ぶ" };

const MAJOR_META: Record<string, { hue: string; label: string }> = {
  strategy: { hue: "#FF375F", label: "ストラテジ系" },
  management: { hue: "#FF9500", label: "マネジメント系" },
  technology: { hue: "#0A84FF", label: "テクノロジ系" },
};

/**
 * 学ぶ — 入門者向けの解説記事一覧。学習プラットフォームらしい教科書
 * トーン (色付きジャンルバッジ + 読了目安 + 関連問題数) で並べる。
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
    <div className="mx-auto max-w-[760px] space-y-8 pb-12">
      <header className="space-y-2 pt-1">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
          学ぶ
        </h1>
        <p className="max-w-[58ch] text-[14px] leading-[1.8] text-muted-foreground text-pretty">
          ITパスポートの主要論点を、図解と日常のたとえを使ってやさしく解説します。
          1 記事 4〜6 分で読み切れる長さ。読み終えたら、その場で関連問題に進めます。
        </p>
      </header>

      {items.length === 0 ? (
        <div className="surface-card p-6 text-center text-[13px] text-muted-foreground">
          記事を準備中です。
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map(({ lesson, topic }, idx) => {
            const meta = MAJOR_META[topic.majorCategory] ?? {
              hue: "#8E8E93",
              label: "論点",
            };
            return (
              <li key={lesson.slug}>
                <Link
                  href={`/learn/study/${lesson.slug}`}
                  className="surface-card group grid grid-cols-[44px_1fr_auto] items-start gap-4 p-5"
                >
                  <span
                    className="num flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold"
                    style={{ background: `${meta.hue}14`, color: meta.hue }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5"
                        style={{ background: `${meta.hue}14`, color: meta.hue }}
                      >
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                        {topic.minorTopic}
                      </span>
                      {lesson.dek && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          {lesson.dek}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 text-[18px] font-semibold leading-snug tracking-tight text-balance sm:text-[20px]">
                      {lesson.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 max-w-[58ch] text-[13px] leading-[1.8] text-muted-foreground text-pretty">
                      {lesson.hook}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="num font-semibold text-foreground">
                          {lesson.readingMinutes}
                        </span>{" "}
                        分で読める
                      </span>
                      <span aria-hidden className="text-border">
                        ·
                      </span>
                      <span>
                        関連問題{" "}
                        <span className="num font-semibold text-foreground">
                          {lesson.questionCount}
                        </span>{" "}
                        問
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="mt-3 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
