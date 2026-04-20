import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Crosshair,
  Flame,
  Shuffle,
  Sparkles,
  Target,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { getRoadmap, type RoadmapMajor } from "@/server/queries/roadmap";
import { getRecommendation } from "@/server/queries/history";

export const dynamic = "force-dynamic";
export const metadata = { title: "攻め方を選ぶ" };

const MAJOR_GRAD: Record<string, string> = {
  strategy: "bg-grad-purple",
  management: "bg-grad-ocean",
  technology: "bg-grad-green",
};

/**
 * High-level entry-point for self-directed practice.
 *
 * Deliberately does NOT list individual questions, stems, or IDs. Instead
 * it presents three paths: (1) recommended moves, (2) pillar summary +
 * link into the roadmap, (3) filter-driven random draw. Individual
 * questions are only reachable via session flows — keeps DB content
 * behind practice rather than a browsable index.
 */
export default async function QuestionsIndexPage() {
  const user = await readCurrentUser();
  const signedIn = !!user?.isSignedIn;
  const [roadmap, rec] = await Promise.all([
    getRoadmap(user?.id ?? null),
    signedIn ? getRecommendation(user!.id) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-7">
      <header className="pt-1">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Play
        </div>
        <h1 className="mt-1.5 text-ios-large font-semibold">攻め方を選ぶ</h1>
        <p className="mt-1 text-[14px] text-muted-foreground text-pretty">
          どこから切り込む？目的別のセッションで、今日の一歩を選べます。
        </p>
      </header>

      {/* Recommended next move */}
      {signedIn && rec && (
        <Link
          href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
          className="surface-card flex items-center gap-4 p-4 transition-transform active:scale-[0.99]"
        >
          <span className="tile-icon bg-grad-orange">
            <Flame className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
              今日のおすすめ — {rec.reason}
            </div>
            <div className="truncate text-[16px] font-semibold">{rec.title}</div>
            <div className="text-[11.5px] text-muted-foreground">
              重み付き抽選で5問
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      )}

      {/* Primary modes — hero tiles */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/learn/session/new?mode=weakness&count=5"
          className="hero-tile bg-grad-sunset sm:col-span-2"
        >
          <div className="relative z-10 flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
              <Crosshair className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                Sharpen
              </div>
              <div className="mt-0.5 text-[19px] font-semibold leading-tight tracking-tight">
                弱点5問チャレンジ
              </div>
              <div className="mt-0.5 text-[12.5px] opacity-85">
                誤解パターン重み付きで自動抽出
              </div>
            </div>
            <ChevronRight className="h-5 w-5 opacity-80" />
          </div>
        </Link>

        <Link href="/learn/random" className="hero-tile bg-grad-purple">
          <div className="relative z-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
              <Shuffle className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div className="mt-4 text-[18px] font-semibold leading-tight tracking-tight">
              ランダム1問
            </div>
            <div className="mt-0.5 text-[12.5px] opacity-85">
              全範囲から1問
            </div>
          </div>
        </Link>

        <Link href="/learn/mock-exam" className="hero-tile bg-grad-ocean">
          <div className="relative z-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
              <Target className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div className="mt-4 text-[18px] font-semibold leading-tight tracking-tight">
              模擬試験
            </div>
            <div className="mt-0.5 text-[12.5px] opacity-85">
              100問 / 120分
            </div>
          </div>
        </Link>
      </section>

      {/* Pillars — summarised topic counts, links into per-major selections */}
      <section className="space-y-2">
        <div className="flex items-end justify-between px-1">
          <div>
            <div className="section-title">3 Pillars</div>
            <div className="text-[17px] font-semibold tracking-tight">
              範囲から選ぶ
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {roadmap.map((m) => (
            <PillarCard key={m.major} major={m} signedIn={signedIn} />
          ))}
        </div>
      </section>

      {/* Deep-dive links — roadmap + misconception dictionary */}
      <section className="space-y-2">
        <div className="ios-section-label">掘り下げる</div>
        <div className="ios-list">
          <Row
            href="/topics"
            tile="bg-grad-blue"
            icon={Sparkles}
            title="論点マップ"
            desc="全論点を一覧。詳細から関連セッションへ"
          />
          <Row
            href="/misconceptions"
            tile="bg-grad-orange"
            icon={Target}
            title="誤解パターン辞典"
            desc="ひっかけの正体を予習"
          />
          <Row
            href="/guides"
            tile="bg-grad-green"
            icon={ArrowRight}
            title="学習ガイド"
            desc="3大領域の概観を読む"
          />
        </div>
      </section>
    </div>
  );
}

function PillarCard({
  major,
  signedIn,
}: {
  major: RoadmapMajor;
  signedIn: boolean;
}) {
  const grad = MAJOR_GRAD[major.major] ?? "bg-grad-ink";
  const total = major.topicCount;
  const pct =
    total === 0
      ? 0
      : Math.round(((major.attemptedCount + major.masteredCount) / (total * 2)) * 100);

  return (
    <Link
      href={`/guides/${major.major}`}
      className={`hero-tile ${grad} !p-5`}
    >
      <div className="relative z-10 space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
          {major.minors.length} areas
        </div>
        <div className="text-[18px] font-semibold leading-tight tracking-tight">
          {major.label}
        </div>
        <div className="text-[12px] leading-relaxed opacity-85 text-pretty line-clamp-2">
          {major.intro}
        </div>
        {signedIn && (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <div className="num mt-1.5 text-[11px] font-medium opacity-85">
              習熟度 {pct}% · {major.masteredCount}/{total} 習熟
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function Row({
  href,
  tile,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  tile: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="ios-row active:bg-muted/60">
      <span className={`tile-icon-sm ${tile}`}>
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[12.5px] text-muted-foreground">{desc}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
