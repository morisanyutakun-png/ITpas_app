import Link from "next/link";
import {
  Archive,
  ArrowUpRight,
  ChevronRight,
  Crosshair,
  ListChecks,
  Network,
  PlayCircle,
  Shuffle,
  Skull,
  Sparkles,
  Target,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { hasFeature } from "@/lib/plan";
import { getRecommendation } from "@/server/queries/history";
import { listPastExams } from "@/server/queries/pastExams";

export const dynamic = "force-dynamic";
export const metadata = { title: "学習" };

export default async function LearnHubPage() {
  const user = await readCurrentUser();
  const signedIn = !!user?.isSignedIn;
  const canMock = hasFeature(user, "mockExam");
  const [rec, pastExams] = await Promise.all([
    signedIn ? getRecommendation(user!.id) : Promise.resolve(null),
    listPastExams(),
  ]);

  return (
    <div className="space-y-8 pb-10">
      {/* ── Editorial header ───────────────────── */}
      <header className="space-y-1.5 pt-1">
        <div className="kicker">Library</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          学習
        </h1>
        <p className="text-[13.5px] text-muted-foreground text-pretty">
          どこから攻めるか。目的別の入口を用意しました。
        </p>
      </header>

      {/* ── Recommended — editorial hero (when signed in) ── */}
      {rec && (
        <Link
          href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
          className="editorial-card group relative block p-6 sm:p-7"
        >
          <div className="relative z-10 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <div className="kicker">Editor's Pick · {rec.reason}</div>
              <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-balance sm:text-[30px]">
                {rec.title}
              </h2>
              <p className="max-w-md text-[13px] text-muted-foreground text-pretty">
                {rec.attempted > 0
                  ? `これまで ${rec.attempted}問 / 正答率 ${Math.round(rec.correctRate * 100)}%。伸び代を5問で詰める。`
                  : "まだ触れていない論点。ここから地盤を固めよう。"}
              </p>
              <div className="pt-1">
                <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13.5px] font-semibold text-background shadow-ios transition-transform group-active:scale-[0.98]">
                  <PlayCircle className="h-4 w-4" />
                  5問で攻める
                </span>
              </div>
            </div>
            <div
              aria-hidden
              className="pointer-events-none hidden h-[120px] w-[120px] shrink-0 items-center justify-center sm:flex"
            >
              <div className="relative grid place-items-center">
                <span className="absolute inset-[-14px] rounded-full bg-grad-sunset opacity-55 blur-2xl" />
                <span className="relative flex h-[100px] w-[100px] items-center justify-center rounded-3xl bg-grad-sunset text-white shadow-hero">
                  <Target className="h-9 w-9" strokeWidth={2.0} />
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* ── Modes (tall hero + 2 squares) ────── */}
      <section className="space-y-3">
        <div className="rule-label">Practice Modes</div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ModeHeroTile
            href="/learn/session/new?mode=weakness&count=5"
            grad="bg-grad-sunset"
            icon={Crosshair}
            kicker="Sharpen"
            title="弱点5問チャレンジ"
            sub="誤解パターン重みで自動抽選"
            className="sm:col-span-3"
          />
          <ModeTile
            href="/learn/random"
            grad="bg-grad-purple"
            icon={Shuffle}
            title="ランダム1問"
            sub="全範囲から1問"
          />
          <ModeTile
            href="/learn/mock-exam"
            grad="bg-grad-ocean"
            icon={Timer}
            title="模擬試験"
            sub="100問 / 120分"
            lockedLabel={canMock ? undefined : "Pro"}
          />
          <ModeTile
            href="/learn/past-exams"
            grad="bg-grad-ink"
            icon={Archive}
            title="過去問アーカイブ"
            sub={`IPA公開 ${pastExams.length}回分`}
          />
        </div>
      </section>

      {/* ── Explore by structure ─────────────── */}
      <section className="space-y-3">
        <div className="rule-label">Explore</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ExploreCard
            href="/topics"
            accent="#0A84FF"
            icon={Network}
            kicker="Topic Map"
            title="論点マップ"
            desc="OSI / 暗号 / PM — ノードから関連問題へ"
          />
          <ExploreCard
            href="/misconceptions"
            accent="#FF9500"
            icon={Skull}
            kicker="Trap Dictionary"
            title="誤解パターン辞典"
            desc="ひっかけの正体を予習する"
          />
          <ExploreCard
            href="/guides"
            accent="#34C759"
            icon={ListChecks}
            kicker="Reading Guide"
            title="学習ガイド"
            desc="3大領域の概観を体系的に読む"
          />
          <ExploreCard
            href="/dashboard"
            accent="#AF52DE"
            icon={Sparkles}
            kicker="Analytics"
            title="分析ダッシュボード"
            desc="正答率・ヒートマップで苦手を特定"
          />
        </div>
      </section>

      {/* ── Footer CTA (past exam archive) ──── */}
      <Link
        href="/learn/past-exams"
        className="surface-card group flex items-center gap-4 p-5 transition-transform active:scale-[0.99]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-ink text-white shadow-tile">
          <Zap className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Archive · Sourced from IPA
          </div>
          <div className="text-[16px] font-semibold">
            過去問アーカイブを見る
          </div>
          <div className="text-[12px] text-muted-foreground">
            各回の出典つき · 回別模試 · 収録率を表示
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────

function ModeHeroTile({
  href,
  grad,
  icon: Icon,
  kicker,
  title,
  sub,
  className = "",
}: {
  href: string;
  grad: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  sub: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-5 overflow-hidden rounded-3xl ${grad} p-6 text-white shadow-hero transition-transform active:scale-[0.985] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.22), transparent 55%), radial-gradient(100% 80% at 0% 100%, rgba(0,0,0,0.20), transparent 50%)",
        }}
      />
      <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
        <Icon className="h-6 w-6" strokeWidth={2.2} />
      </span>
      <div className="relative z-10 min-w-0 flex-1">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] opacity-85">
          {kicker}
        </div>
        <div className="mt-1 text-[22px] font-semibold leading-tight tracking-tight">
          {title}
        </div>
        <div className="text-[12.5px] opacity-85">{sub}</div>
      </div>
      <ChevronRight className="relative z-10 h-5 w-5 opacity-80" />
    </Link>
  );
}

function ModeTile({
  href,
  grad,
  icon: Icon,
  title,
  sub,
  lockedLabel,
}: {
  href: string;
  grad: string;
  icon: LucideIcon;
  title: string;
  sub: string;
  lockedLabel?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-3xl ${grad} p-4 text-white shadow-hero transition-transform active:scale-[0.97]`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.22), transparent 55%)",
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        {lockedLabel && (
          <span className="glass-chip">{lockedLabel}</span>
        )}
      </div>
      <div className="relative z-10">
        <div className="text-[17px] font-semibold leading-tight tracking-tight">
          {title}
        </div>
        <div className="text-[11.5px] opacity-85">{sub}</div>
      </div>
    </Link>
  );
}

function ExploreCard({
  href,
  accent,
  icon: Icon,
  kicker,
  title,
  desc,
}: {
  href: string;
  accent: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group surface-card relative block overflow-hidden p-5 transition-transform active:scale-[0.99]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.18] blur-2xl transition-opacity group-hover:opacity-30"
        style={{ background: accent }}
      />
      <div className="relative">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-tile"
          style={{ background: accent }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <div
          className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: accent }}
        >
          {kicker}
        </div>
        <div className="mt-0.5 text-[17px] font-semibold tracking-tight">
          {title}
        </div>
        <p className="mt-1 text-[12.5px] text-muted-foreground text-pretty">
          {desc}
        </p>
        <div className="mt-3 inline-flex items-center gap-0.5 text-[12px] font-medium text-muted-foreground transition-transform group-hover:translate-x-0.5">
          開く <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
