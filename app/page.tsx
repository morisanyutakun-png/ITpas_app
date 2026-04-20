import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Flame,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { hasFeature, isPro } from "@/lib/plan";
import { getLastAttempt, getPersonalSummary } from "@/server/queries/personal";
import { getRecommendation } from "@/server/queries/history";
import { getRoadmap } from "@/server/queries/roadmap";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { Roadmap } from "@/components/home/Roadmap";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const sp = await searchParams;
  const user = await readCurrentUser();
  const signedIn = !!user?.isSignedIn;
  const pro = isPro(user);
  const showAds = !hasFeature(user, "adFree");

  const [summary, last, rec, roadmap] = signedIn
    ? await Promise.all([
        getPersonalSummary(user!.id),
        getLastAttempt(user!.id),
        getRecommendation(user!.id),
        getRoadmap(user!.id),
      ])
    : [null, null, null, await getRoadmap(null)];

  const accuracy =
    summary && summary.totalAttempts > 0
      ? Math.round((summary.correctAttempts / summary.totalAttempts) * 100)
      : null;

  const firstName = user?.displayName?.split(" ")[0];
  const greeting = greetingFor(new Date());

  return (
    <div className="space-y-7">
      {sp.auth_error && <AuthErrorBanner code={sp.auth_error} />}

      {/* Hero greeting — Apple Music "Listen Now"-style header */}
      <header className="pt-1">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          {greeting}
        </div>
        <h1 className="mt-1.5 text-ios-large font-semibold text-balance">
          {signedIn ? (
            <>
              おかえり、<span className="bg-grad-sunset bg-clip-text text-transparent">{firstName ?? "学習者"}</span>さん
            </>
          ) : (
            <>
              理解で解く、<br className="hidden sm:inline" />
              <span className="bg-grad-ocean bg-clip-text text-transparent">ITパスポート</span>。
            </>
          )}
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          {signedIn
            ? pro
              ? "今日もマイペースで理解を積み上げましょう。"
              : "今日の無料枠は10問。続きから再開できます。"
            : "誤答の『魅力理由』から、丸暗記を崩す過去問学習。"}
        </p>
      </header>

      {/* Personal stats strip */}
      {summary && (
        <section
          aria-label="学習サマリー"
          className="surface-card overflow-hidden"
        >
          <div className="grid grid-cols-3 divide-x divide-border/60">
            <MiniStat
              label="連続学習"
              value={`${summary.streakDays}`}
              unit="日"
              accent="text-ios-orange"
            />
            <MiniStat
              label="累計回答"
              value={summary.totalAttempts.toString()}
              unit="問"
              accent="text-foreground"
            />
            <MiniStat
              label="正答率"
              value={accuracy !== null ? `${accuracy}` : "—"}
              unit={accuracy !== null ? "%" : ""}
              accent="text-ios-green"
            />
          </div>
        </section>
      )}

      {/* Primary hero tiles — Apple Music "Featured" style */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/learn/session/new?mode=weakness&count=5"
          className="hero-tile bg-grad-sunset sm:col-span-2"
        >
          <div className="relative z-10 flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
              <Target className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                今日のおすすめ
              </div>
              <div className="mt-0.5 text-[22px] font-semibold leading-tight tracking-tight">
                弱点5問チャレンジ
              </div>
              <div className="mt-0.5 text-[13.5px] opacity-85">
                あなたの誤解パターンに刺さる5問
              </div>
            </div>
            <ChevronRight className="h-5 w-5 opacity-80" />
          </div>
        </Link>

        <Link
          href="/learn/random"
          className="hero-tile bg-grad-ocean"
        >
          <div className="relative z-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
              <PlayCircle className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="mt-4 text-[18px] font-semibold leading-tight tracking-tight">
              ランダムに1問
            </div>
            <div className="mt-0.5 text-[12.5px] opacity-85">
              迷ったらこれ。全範囲から1問
            </div>
          </div>
        </Link>

        <Link
          href="/learn/mock-exam"
          className="hero-tile bg-grad-ink"
        >
          <div className="relative z-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
              <Sparkles className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="mt-4 text-[18px] font-semibold leading-tight tracking-tight">
              模擬試験
            </div>
            <div className="mt-0.5 text-[12.5px] opacity-80">
              100問 / 120分で本番リハーサル
            </div>
          </div>
        </Link>
      </section>

      {/* Learning roadmap — 3 majors × minorTopics with progress dots */}
      {roadmap && roadmap.length > 0 && (
        <Roadmap majors={roadmap} signedIn={signedIn} />
      )}

      {/* Continuation + recommendation */}
      {(last || rec) && (
        <section className="space-y-2">
          <div className="ios-section-label">続ける</div>
          <div className="ios-list">
            {last && (
              <Link
                href={
                  last.sessionId
                    ? `/learn/session/${last.sessionId}`
                    : `/learn/questions/${last.questionId}`
                }
                className="ios-row active:bg-muted/60"
              >
                <span className="tile-icon-sm bg-grad-blue">
                  <PlayCircle className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium">
                    {last.sessionId ? "前回のセッションを再開" : "直前の問題を開く"}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}
            {rec && (
              <Link
                href={`/learn/session/new?mode=topic&topic=${rec.slug}&count=5`}
                className="ios-row active:bg-muted/60"
              >
                <span className="tile-icon-sm bg-grad-orange">
                  <Flame className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-medium">{rec.title}</div>
                  <div className="truncate text-[12px] text-muted-foreground">
                    {rec.reason} — おすすめ5問
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Sign-in nudge */}
      {!signedIn && (
        <section className="surface-card p-6">
          <div className="text-ios-headline font-semibold">
            端末をまたいで進捗を残す
          </div>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
            Googleでログインすると、ブックマーク / 弱点レコメンド / 続きから再開 が有効になります。
          </p>
          <Link
            href="/api/auth/google/login?returnTo=/"
            className="pill-neutral mt-4 inline-flex h-10 gap-1.5 px-4 text-[14px]"
          >
            Googleでログイン
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Upgrade nudge */}
      {signedIn && showAds && (
        <section className="relative overflow-hidden rounded-3xl bg-grad-purple p-6 text-white shadow-hero">
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
              <Sparkles className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                Pro
              </div>
              <div className="mt-0.5 text-[20px] font-semibold leading-tight tracking-tight">
                本気で合格を狙うなら
              </div>
              <p className="mt-1 text-[13.5px] opacity-85">
                1日無制限 / 詳細分析 / 模擬試験 / 広告非表示 — 月額 ¥780。
              </p>
              <Link
                href="/pricing"
                className="pill mt-4 h-10 gap-1.5 bg-white px-4 text-[14px] text-foreground shadow-ios"
              >
                プランを見る
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </section>
      )}

      {/* Concept section */}
      <section className="space-y-2">
        <div className="ios-section-label">理解ノートの特徴</div>
        <div className="ios-list">
          <FeatureRow
            tile="bg-grad-sunset"
            emoji="✨"
            title="誤答ごとの『魅力理由』"
            desc="全ての誤答に『なぜ引き寄せられたか』を明示"
          />
          <FeatureRow
            tile="bg-grad-blue"
            emoji="🎯"
            title="誤解パターン別の弱点分析"
            desc="単元ではなく『どこでズレたか』で積み上げる"
          />
          <FeatureRow
            tile="bg-grad-green"
            emoji="📚"
            title="比較表 / 補助資料へ1タップ"
            desc="似た用語・計算ルールへ問題から直接ジャンプ"
          />
        </div>
      </section>
    </div>
  );
}

function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Late Night";
  if (h < 11) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Late Night";
}

function MiniStat({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 py-5 text-center">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className={`num text-[26px] font-semibold tracking-tight ${accent}`}>
          {value}
        </span>
        {unit && (
          <span className="text-[12px] font-medium text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}

function FeatureRow({
  tile,
  emoji,
  title,
  desc,
}: {
  tile: string;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="ios-row">
      <span className={`tile-icon-sm ${tile} text-[15px]`}>{emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[12.5px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
