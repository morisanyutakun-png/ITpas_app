import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { listTopics } from "@/server/queries/topics";

const MAJOR_META: Record<string, { label: string; grad: string; accent: string }> = {
  strategy:   { label: "ストラテジ系",    grad: "bg-grad-purple", accent: "text-ios-purple" },
  management: { label: "マネジメント系", grad: "bg-grad-ocean",  accent: "text-ios-blue"   },
  technology: { label: "テクノロジ系",   grad: "bg-grad-green",  accent: "text-ios-teal"   },
};

export const dynamic = "force-dynamic";
export const metadata = { title: "論点マップ" };

export default async function TopicsPage() {
  const all = await listTopics();
  const tree = all.reduce<Record<string, Record<string, typeof all>>>((acc, t) => {
    (acc[t.majorCategory] ||= {});
    (acc[t.majorCategory][t.minorTopic] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-7">
      <header className="pt-1">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Topics
        </div>
        <h1 className="mt-1.5 text-ios-large font-semibold">論点マップ</h1>
        <p className="mt-1 text-[14px] text-muted-foreground text-pretty">
          ITパスポートの学習論点を領域ごとに整理。タップで学習ノートと演習へ。
        </p>
      </header>

      {(["strategy", "management", "technology"] as const).map((major) => {
        const meta = MAJOR_META[major];
        const minors = tree[major] ?? {};
        const total = Object.values(minors).reduce((n, l) => n + l.length, 0);
        if (total === 0) return null;
        return (
          <section key={major} className="space-y-3">
            <div className={`hero-tile ${meta.grad} !p-4`}>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                    {Object.keys(minors).length} areas · {total} topics
                  </div>
                  <div className="mt-0.5 text-[19px] font-semibold leading-tight tracking-tight">
                    {meta.label}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(minors).map(([minor, list]) => (
                <div key={minor} className="space-y-2">
                  <div
                    className={`px-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${meta.accent}`}
                  >
                    {minor}
                  </div>
                  <div className="ios-list">
                    {list.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/topics/${t.slug}`}
                        className="ios-row active:bg-muted/60"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[15px] font-semibold">
                            {t.title}
                          </div>
                          <div className="line-clamp-1 text-[12.5px] text-muted-foreground">
                            {t.summary}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
