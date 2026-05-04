import Link from "next/link";
import {
  Archive,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock,
  Layers,
  PlayCircle,
  Shuffle,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import { hasFeature, isPro, limitsFor } from "@/lib/plan";
import { listPastExams } from "@/server/queries/pastExams";

export const dynamic = "force-dynamic";
export const metadata = { title: "演習" };

/**
 * 「演習」ハブ — ToC 向けに目的別に再設計。
 *
 * - 上に「すぐ始める」3 タイル（5分 / 15分 / 模試）— 時間で選ぶ
 * - 中段に「弱点を潰す」「型別」「ランダム」— 目的で選ぶ
 * - 下段に「年度別アーカイブ」と「読み物に戻る」— 詳細導線
 *
 * 旧ページ (page.tsx) の 3 ModeCard ベースから「ユーザーの動機 → アクション」
 * へ並びを変えた。Free ユーザーには 1 日制限を表示し、フリクションを下げる。
 */
export default async function LearnHubPage() {
  const user = await getCurrentUser();
  const pro = isPro(user);
  const canMock = hasFeature(user, "mockExam");
  const dailyLimit = limitsFor(user.plan).dailyQuestionAttempts;
  const pastExams = await listPastExams();
  const recentExams = pastExams.slice(0, 6);

  return (
    <div className="space-y-9 pb-12">
      <header className="space-y-1.5 pt-1">
        <div className="kicker">Practice</div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
          演習
        </h1>
        <p className="max-w-[52ch] text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
          時間で選ぶか、目的で選ぶか。今のあなたに合ったセッションを。
          {!pro && Number.isFinite(dailyLimit) && (
            <>
              {" "}
              無料枠は今日{" "}
              <span className="font-semibold text-foreground">
                {dailyLimit as number}問
              </span>
              までです。
            </>
          )}
        </p>
      </header>

      {/* ── すぐ始める（時間で選ぶ） ───────────── */}
      <Section title="すぐ始める" sub="今ある時間に合わせて">
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickTile
            href="/learn/random"
            grad="bg-grad-purple"
            icon={Shuffle}
            kicker="5分"
            title="サクッと1問"
            sub="気分転換・通勤に"
          />
          <QuickTile
            href="/learn/session/new?mode=weakness&count=5"
            grad="bg-grad-sunset"
            icon={Target}
            kicker="15分"
            title="弱点を5問"
            sub="苦手から重み付け"
          />
          <QuickTile
            href={canMock ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
            grad="bg-grad-ocean"
            icon={Timer}
            kicker={canMock ? "120分" : "Pro"}
            title="模擬試験"
            sub={canMock ? "本番形式100問" : "Pro で開放"}
            locked={!canMock}
          />
        </div>
      </Section>

      {/* ── 目的で選ぶ ───────────── */}
      <Section title="目的で選ぶ" sub="勉強の意図に合わせて">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <PurposeRow
            href="/learn/session/new?mode=weakness&count=5"
            icon={Target}
            hue="#FF9500"
            title="苦手をピンポイントで潰す"
            sub="誤解パターンの重み付きで5問"
            cta="弱点5問を始める"
          />
          <PurposeRow
            href="/misconceptions"
            icon={Layers}
            hue="#5856D6"
            title="型ごとに集中演習"
            sub="言い換え罠・階層混同など5型から選ぶ"
            cta="型を選ぶ"
          />
          <PurposeRow
            href="/learn/random"
            icon={Shuffle}
            hue="#AF52DE"
            title="ランダムで腕試し"
            sub="全範囲から1問抽選"
            cta="ランダムで1問"
          />
          <PurposeRow
            href="/learn/study"
            icon={BookOpen}
            hue="#0A84FF"
            title="読んでから解く"
            sub="記事を読んで関連問題で定着"
            cta="記事一覧へ"
          />
        </div>
      </Section>

      {/* ── 年度別アーカイブ ───────────── */}
      <Section
        title="年度別で解く"
        sub="本試験そのままの順序で挑戦"
        rightHref="/learn/past-exams"
        rightLabel="すべての年度"
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {recentExams.map((e) => (
            <Link
              key={e.slug}
              href={`/learn/past-exams#${e.slug}`}
              className="group flex items-center gap-3 rounded-2xl bg-card p-3.5 ring-1 ring-black/[0.04] shadow-surface transition-transform active:scale-[0.99] dark:ring-white/[0.06]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grad-ink text-white shadow-tile">
                <Archive className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="num text-[13px] font-semibold leading-tight">
                  {e.shortLabel}
                </div>
                <div className="num text-[11px] text-muted-foreground">
                  {e.importedCount} 問収録
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </Section>

      {/* ── 戻る導線 ───────────── */}
      <Link
        href="/learn/study"
        className="surface-card flex items-center gap-4 p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-blue text-white shadow-tile">
          <BookOpen className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15.5px] font-semibold tracking-tight">
            記事を読みに戻る
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            読んでから解くと、ぐっと定着します
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}

function Section({
  title,
  sub,
  rightHref,
  rightLabel,
  children,
}: {
  title: string;
  sub?: string;
  rightHref?: string;
  rightLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold tracking-tight sm:text-[19px]">
            {title}
          </h2>
          {sub && (
            <p className="mt-0.5 text-[12px] text-muted-foreground text-pretty">
              {sub}
            </p>
          )}
        </div>
        {rightHref && rightLabel && (
          <Link
            href={rightHref}
            className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
          >
            {rightLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function QuickTile({
  href,
  grad,
  icon: Icon,
  kicker,
  title,
  sub,
  locked,
}: {
  href: string;
  grad: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  sub: string;
  locked?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-3xl ${grad} p-4 text-white shadow-hero transition-transform active:scale-[0.97]`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.22), transparent 55%), radial-gradient(100% 80% at 0% 100%, rgba(0,0,0,0.20), transparent 50%)",
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-semibold backdrop-blur">
          <Clock className="h-2.5 w-2.5" />
          {locked ? "Pro" : kicker}
        </span>
      </div>
      <div className="relative z-10">
        <div className="text-[16px] font-semibold leading-tight tracking-tight">
          {title}
        </div>
        <div className="text-[11.5px] opacity-85">{sub}</div>
      </div>
    </Link>
  );
}

function PurposeRow({
  href,
  icon: Icon,
  hue,
  title,
  sub,
  cta,
}: {
  href: string;
  icon: LucideIcon;
  hue: string;
  title: string;
  sub: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group surface-card flex items-center gap-3.5 p-4 sm:p-5"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-tile"
        style={{ background: hue }}
      >
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold tracking-tight">{title}</div>
        <div className="text-[12px] text-muted-foreground">{sub}</div>
      </div>
      <span className="hidden shrink-0 items-center gap-1 text-[12.5px] font-semibold text-muted-foreground group-hover:text-foreground sm:inline-flex">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground sm:hidden" />
    </Link>
  );
}
