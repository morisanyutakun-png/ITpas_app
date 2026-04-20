import Link from "next/link";
import { ArrowRight, ChevronRight, Flame, PlayCircle, Target } from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { hasFeature, isPro } from "@/lib/plan";
import { getLastAttempt, getPersonalSummary } from "@/server/queries/personal";
import { getRecommendation } from "@/server/queries/history";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";

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

  const [summary, last, rec] = signedIn
    ? await Promise.all([
        getPersonalSummary(user!.id),
        getLastAttempt(user!.id),
        getRecommendation(user!.id),
      ])
    : [null, null, null];

  const accuracy =
    summary && summary.totalAttempts > 0
      ? Math.round((summary.correctAttempts / summary.totalAttempts) * 100)
      : null;

  return (
    <div className="space-y-6">
      {sp.auth_error && <AuthErrorBanner code={sp.auth_error} />}

      {/* Large title (iOS navigation-bar style) */}
      <header className="pt-2">
        <h1 className="text-ios-large font-semibold">
          {signedIn ? `こんにちは、${user!.displayName?.split(" ")[0] ?? "学習者"}さん` : "理解ノート"}
        </h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          {signedIn
            ? pro
              ? "今日もマイペースで学習を積み上げましょう。"
              : "今日の無料枠は10問。続きから再開できます。"
            : "誤答の『魅力理由』から、丸暗記を崩す過去問学習。"}
        </p>
      </header>

      {/* Personal stats strip (when signed in) */}
      {summary && (
        <section aria-label="学習サマリー" className="ios-list shadow-ios-sm">
          <div className="grid grid-cols-3 divide-x divide-border/60">
            <MiniStat
              label="連続学習"
              value={`${summary.streakDays}`}
              unit="日"
            />
            <MiniStat
              label="累計回答"
              value={summary.totalAttempts.toString()}
              unit="問"
            />
            <MiniStat
              label="正答率"
              value={accuracy !== null ? `${accuracy}` : "—"}
              unit={accuracy !== null ? "%" : ""}
            />
          </div>
        </section>
      )}

      {/* Primary CTA cards */}
      <section className="space-y-3">
        <Link
          href="/learn/session/new?mode=weakness&count=5"
          className="group flex items-center gap-4 rounded-2xl bg-card p-4 shadow-ios-sm active:opacity-70"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Target className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-ios-headline font-semibold">弱点5問</div>
            <div className="text-[13px] text-muted-foreground">
              あなたの誤解パターンに刺さる5問
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-active:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/learn/random"
          className="group flex items-center gap-4 rounded-2xl bg-card p-4 shadow-ios-sm active:opacity-70"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground">
            <PlayCircle className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-ios-headline font-semibold">ランダムに1問</div>
            <div className="text-[13px] text-muted-foreground">
              迷ったらこれ。全範囲から1問
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      </section>

      {/* Continuation + recommendation */}
      {(last || rec) && (
        <section className="space-y-2">
          <div className="ios-section-label">続ける</div>
          <div className="ios-list shadow-ios-sm">
            {last && (
              <Link
                href={
                  last.sessionId
                    ? `/learn/session/${last.sessionId}`
                    : `/learn/questions/${last.questionId}`
                }
                className="ios-row group active:bg-muted/60"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                  <PlayCircle className="h-4 w-4" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
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
                className="ios-row group active:bg-muted/60"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Flame className="h-4 w-4 text-ios-red" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
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

      {/* Sign-in nudge / upgrade nudge */}
      {!signedIn && (
        <section className="rounded-2xl bg-card p-5 shadow-ios-sm">
          <div className="text-ios-headline font-semibold">
            端末をまたいで進捗を残す
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Googleでログインすると、ブックマーク / 弱点レコメンド / 続きから再開 が有効になります。
          </p>
          <Link
            href="/api/auth/google/login?returnTo=/"
            className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[14px] font-semibold text-background active:opacity-80"
          >
            Googleでログイン
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {signedIn && showAds && (
        <section className="rounded-2xl bg-card p-5 shadow-ios-sm">
          <div className="text-ios-headline font-semibold">
            本気で合格を狙うなら Pro
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            1日無制限 / 詳細分析 / 模擬試験 / 広告非表示 — 月額 ¥780。
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[14px] font-semibold text-primary-foreground active:opacity-80"
          >
            プランを見る
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Concept section (shown to everyone for SEO + onboarding) */}
      <section className="space-y-2">
        <div className="ios-section-label">理解ノートの特徴</div>
        <div className="ios-list shadow-ios-sm">
          <FeatureRow
            emoji="✨"
            title="誤答ごとの『魅力理由』"
            desc="全ての誤答に『なぜ引き寄せられたか』を明示"
          />
          <FeatureRow
            emoji="🎯"
            title="誤解パターン別の弱点分析"
            desc="単元ではなく『どこでズレたか』で積み上げる"
          />
          <FeatureRow
            emoji="📚"
            title="比較表 / 補助資料へ1タップ"
            desc="似た用語・計算ルールへ問題から直接ジャンプ"
          />
        </div>
      </section>
    </div>
  );
}

function MiniStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-4 text-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[22px] font-semibold tabular-nums">{value}</span>
        {unit && (
          <span className="text-[12px] text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}

function FeatureRow({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="ios-row">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-base">
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium">{title}</div>
        <div className="text-[12px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
