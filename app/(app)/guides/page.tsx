import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { listMajorGuides } from "@/server/queries/guides";
import { getRoadmap } from "@/server/queries/roadmap";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "学習ガイド",
  description:
    "ITパスポート3大領域の論点を、参考書のように体系的に整理した学習ガイド。",
};

const MAJOR_META: Record<
  string,
  { hue: string; label: string; number: string }
> = {
  strategy: { hue: "#FF375F", label: "STRATEGY", number: "01" },
  management: { hue: "#FF9500", label: "MANAGEMENT", number: "02" },
  technology: { hue: "#0A84FF", label: "TECHNOLOGY", number: "03" },
};

export default async function GuidesIndex() {
  const user = await readCurrentUser();
  const [guides, roadmap] = await Promise.all([
    Promise.resolve(listMajorGuides()),
    getRoadmap(user?.id ?? null),
  ]);
  const progressByMajor = new Map(
    roadmap.map((r) => [r.major, r])
  );

  return (
    <div className="space-y-8 pb-10">
      {/* ── Editorial header ───────── */}
      <header className="space-y-1.5 pt-1">
        <div className="kicker">Reading Guide</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          学習ガイド
        </h1>
        <p className="text-[13.5px] text-muted-foreground text-pretty">
          ITパスポート3大領域の論点を、参考書のように体系的に整理。
          各章から論点詳細・補助資料・関連問題へ直接飛べます。
        </p>
      </header>

      {/* ── 3 Magazine-style chapter covers ── */}
      <section className="space-y-3">
        {guides.map((g, i) => {
          const meta = MAJOR_META[g.slug] ?? {
            hue: "#8E8E93",
            label: g.label,
            number: String(i + 1).padStart(2, "0"),
          };
          const p = progressByMajor.get(
            g.slug as "strategy" | "management" | "technology"
          );
          const pct =
            p && p.topicCount > 0
              ? Math.round((p.masteredCount / p.topicCount) * 100)
              : 0;
          return (
            <GuideChapterCard
              key={g.slug}
              href={`/guides/${g.slug}`}
              number={meta.number}
              hue={meta.hue}
              label={meta.label}
              title={g.label}
              intro={g.intro}
              coverage={g.coverage}
              mastery={pct}
              topics={p?.topicCount ?? 0}
              minors={p?.minors.length ?? 0}
            />
          );
        })}
      </section>

      <div className="px-1 text-[11.5px] text-muted-foreground">
        各章は 中項目 (minor) → 論点 (topic) → 問題 (question) の3層構造。
      </div>
    </div>
  );
}

function GuideChapterCard({
  href,
  number,
  hue,
  label,
  title,
  intro,
  coverage,
  mastery,
  topics,
  minors,
}: {
  href: string;
  number: string;
  hue: string;
  label: string;
  title: string;
  intro: string;
  coverage: string;
  mastery: number;
  topics: number;
  minors: number;
}) {
  return (
    <Link
      href={href}
      className="group editorial-card relative block overflow-hidden"
    >
      <div className="relative z-10 grid gap-0 sm:grid-cols-[auto_1fr]">
        {/* Left column: magazine "cover" panel */}
        <div
          className="relative flex flex-col justify-between p-5 sm:w-[220px] sm:p-6"
          style={{
            background: `linear-gradient(160deg, ${hue}14 0%, ${hue}05 70%, transparent 100%)`,
          }}
        >
          <div
            aria-hidden
            className="album-glyph pointer-events-none absolute right-2 top-0 text-[120px] leading-none opacity-[0.22] sm:text-[160px]"
            style={{ color: hue }}
          >
            {number}
          </div>
          <div className="relative">
            <div
              className="text-[10.5px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: hue }}
            >
              Chapter {number}
            </div>
            <div className="mt-0.5 text-[11.5px] font-medium text-muted-foreground">
              {label}
            </div>
          </div>
          <div className="relative mt-10 flex items-baseline gap-3 sm:mt-16">
            <div>
              <div className="num text-[22px] font-semibold leading-none tracking-tight">
                {mastery}
                <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
                  %
                </span>
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Mastery
              </div>
            </div>
            <span aria-hidden className="h-7 w-px bg-border" />
            <div>
              <div className="num text-[22px] font-semibold leading-none tracking-tight">
                {topics}
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Topics
              </div>
            </div>
            <span aria-hidden className="h-7 w-px bg-border" />
            <div>
              <div className="num text-[22px] font-semibold leading-none tracking-tight">
                {minors}
              </div>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Areas
              </div>
            </div>
          </div>
        </div>

        {/* Right column: editorial body */}
        <div className="border-t border-border p-5 sm:border-l sm:border-t-0 sm:p-6">
          <div className="text-[22px] font-semibold leading-tight tracking-tight">
            {title}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground text-pretty">
            {intro}
          </p>
          <div className="mt-4 rounded-xl bg-muted/60 p-3">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Covered
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-foreground/85">
              {coverage}
            </p>
          </div>
          <div
            className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold transition-transform group-hover:translate-x-0.5"
            style={{ color: hue }}
          >
            <BookOpen className="h-4 w-4" />
            章を開く
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
