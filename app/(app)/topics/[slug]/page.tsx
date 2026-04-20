import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, ChevronRight, Crosshair } from "lucide-react";
import { getTopic } from "@/server/queries/topics";
import { Markdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

const MAJOR_META: Record<string, { label: string; grad: string }> = {
  strategy:   { label: "ストラテジ系",    grad: "bg-grad-purple" },
  management: { label: "マネジメント系", grad: "bg-grad-ocean"  },
  technology: { label: "テクノロジ系",   grad: "bg-grad-green"  },
};

/**
 * Topic detail — the body is the study material. We intentionally do NOT
 * list individual questions for this topic; exploration happens via the
 * "この論点で5問演習" session start. Keeps DB content behind practice.
 */
export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getTopic(slug);
  if (!data) notFound();
  const { topic, materials, questions } = data;
  const meta = MAJOR_META[topic.majorCategory] ?? {
    label: topic.majorCategory,
    grad: "bg-grad-ink",
  };
  const questionCount = questions.length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Hero header */}
      <header
        className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-hero ${meta.grad}`}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 ring-1 ring-inset ring-white/25 backdrop-blur">
              {meta.label}
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 ring-1 ring-inset ring-white/25 backdrop-blur">
              {topic.minorTopic}
            </span>
          </div>
          <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-balance">
            {topic.title}
          </h1>
          <p className="mt-1.5 text-[14px] leading-relaxed opacity-90 text-pretty">
            {topic.summary}
          </p>
          {questionCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={`/learn/session/new?mode=topic&topic=${topic.slug}&count=5`}
                className="pill h-10 gap-1.5 bg-white px-4 text-[14px] text-foreground shadow-ios"
              >
                この論点で5問演習
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur">
                関連問題 {questionCount}問
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Study body */}
      {topic.body && (
        <article className="surface-card p-6 md:p-8">
          <div className="section-title mb-3">学習ノート</div>
          <div className="prose prose-sm max-w-none text-[15.5px] leading-[1.85] prose-headings:tracking-tight">
            <Markdown>{topic.body}</Markdown>
          </div>
        </article>
      )}

      {/* Related materials */}
      {materials.length > 0 && (
        <section className="space-y-2">
          <div className="ios-section-label">関連補助資料</div>
          <div className="ios-list">
            {materials.map((m) => (
              <Link
                key={m.slug}
                href={`/materials/${m.slug}`}
                className="ios-row active:bg-muted/60"
              >
                <span className="tile-icon-sm bg-grad-blue">
                  <BookOpen className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <span className="flex-1 truncate text-[15px] font-medium">
                  {m.title}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA row */}
      <section className="flex flex-col gap-2 pt-1 md:flex-row">
        {questionCount > 0 && (
          <Link
            href={`/learn/session/new?mode=topic&topic=${topic.slug}&count=5`}
            className="pill-primary h-12 flex-1 gap-1.5 px-5 text-[15px]"
          >
            <Crosshair className="h-4 w-4" />
            この論点で5問演習
          </Link>
        )}
        <Link
          href="/topics"
          className="pill-ghost h-12 px-5 text-[15px] md:flex-none"
        >
          論点マップへ戻る
        </Link>
      </section>
    </div>
  );
}
