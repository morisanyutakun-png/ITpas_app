import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  ChevronRight,
  Clock,
  Crown,
  Flame,
  Gauge,
  Layers,
  Lock,
  PlayCircle,
  Rocket,
  Sparkles,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import {
  getMockExamTemplates,
  type MockExamTemplate,
} from "@/lib/examSources";
import {
  hasFeature,
  isPremium,
  limitsFor,
  MOCK_EXAM_DURATION_MIN,
  minAllowedExamYear,
  planLabel,
} from "@/lib/plan";
import { listPastExams } from "@/server/queries/pastExams";
import {
  createMockExamFromTemplateAction,
  createSessionAction,
} from "@/server/actions/sessions";

export const dynamic = "force-dynamic";
export const metadata = { title: "模擬試験" };

const YEAR_GRAD: Record<number, string> = {
  7: "bg-grad-r07",
  6: "bg-grad-r06",
  5: "bg-grad-r05",
  2: "bg-grad-r02",
  1: "bg-grad-r01",
};

const YEAR_GLYPH: Record<number, string> = {
  7: "R7",
  6: "R6",
  5: "R5",
  2: "R2",
  1: "R1",
};

const CATEGORY_META: Record<
  string,
  { grad: string; label: string; kana: string; emoji: string }
> = {
  strategy: {
    grad: "bg-grad-strategy",
    label: "Strategy",
    kana: "ストラテジ",
    emoji: "🧭",
  },
  management: {
    grad: "bg-grad-management",
    label: "Management",
    kana: "マネジメント",
    emoji: "📊",
  },
  technology: {
    grad: "bg-grad-technology",
    label: "Technology",
    kana: "テクノロジ",
    emoji: "⚡",
  },
};

export default async function MockExamEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const user = await readCurrentUser();
  const plan = user?.plan ?? "free";
  const unlocked = hasFeature(user, "mockExam");
  const maxSize = limitsFor(plan).mockExamMaxCount;
  const premium = isPremium(user);
  const minYear = await minAllowedExamYear(plan);
  const pastExams = await listPastExams();
  const templates = getMockExamTemplates();
  const totalPool = pastExams.reduce((a, e) => a + e.importedCount, 0);

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md space-y-5 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-grad-sunset p-8 text-center text-white shadow-hero">
          <div className="relative z-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/30 backdrop-blur">
              <Timer className="h-7 w-7" strokeWidth={2.2} />
            </div>
            <h1 className="mt-4 text-[26px] font-semibold tracking-tight">
              模擬試験は Pro で解放
            </h1>
            <p className="mt-1.5 text-[13px] opacity-90">
              本試験形式 100問 × 120分 / 本物の緊張感を。
            </p>
            <Link
              href="/pricing?reason=mock_exam"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-[14px] font-semibold text-foreground shadow-ios active:opacity-90"
            >
              プランを見る
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
        </div>
      </div>
    );
  }

  // Mock (sourceType=mock) templates: original practice exams, split by shape.
  const mockTemplates = templates.filter((t) => t.sourceType === "mock");
  const fullTemplates = mockTemplates.filter(
    (t) => t.filter.kind === "all" && t.count >= 30
  );
  const categoryTemplates = mockTemplates.filter(
    (t) => t.filter.kind === "category"
  );
  // Past-exam (sourceType=past_exam) templates: IPA verbatim drills by year.
  const pastExamTemplates = templates.filter(
    (t) => t.sourceType === "past_exam" && t.filter.kind === "year"
  );

  const isTplAvailable = (t: MockExamTemplate) => {
    if (t.count > maxSize) return false;
    if (t.tier === "premium" && !premium) return false;
    if (
      t.filter.kind === "year" &&
      minYear != null &&
      t.filter.examYear < minYear
    ) {
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-8 pb-8">
      {/* ── Hero ─────────────────────────────────────── */}
      <header className="space-y-2 pt-1">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-ios-red" />
          Mock Exam Center
        </div>
        <h1 className="text-ios-large font-semibold tracking-tight">
          本番リハーサル
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {MOCK_EXAM_DURATION_MIN}分
          </span>
          <span className="inline-flex items-center gap-1">
            <Archive className="h-3.5 w-3.5" /> 過去問 {pastExams.length} 回分
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> プール{" "}
            <span className="num font-medium text-foreground">{totalPool}</span> 問
          </span>
        </div>
      </header>

      {/* ── Errors ───────────────────────────────────── */}
      {sp.error === "size_locked" && (
        <ErrorBanner>
          選択したサイズは{planLabel(plan)}では利用できません (最大{maxSize}問)。
        </ErrorBanner>
      )}
      {sp.error === "year_locked" && (
        <ErrorBanner>
          この年度は{planLabel(plan)}では未解放です。Premiumで全年度にアクセスできます。
        </ErrorBanner>
      )}
      {sp.error === "empty" && (
        <ErrorBanner tone="red">
          条件に合致する問題がありません。プールが増えるまで別のテンプレートをお試しください。
        </ErrorBanner>
      )}

      {/* ── Featured hero tile (mock_full) ─────────── */}
      {fullTemplates[0] && (
        <section>
          <form
            action={startMockExamFromTemplate}
            className="block"
          >
            <input
              type="hidden"
              name="template"
              value={fullTemplates[0].slug}
            />
            <button
              type="submit"
              className="album-tile w-full bg-grad-sunset !aspect-auto !p-7 sm:!p-9 text-left"
              disabled={!isTplAvailable(fullTemplates[0])}
            >
              <div className="relative z-10 flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-inset ring-white/30 backdrop-blur">
                  <Rocket className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-85">
                    Featured · オリジナル模試
                  </div>
                  <div className="mt-1 text-[28px] font-semibold leading-tight tracking-tight">
                    理解ノート模試 フル
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] opacity-90">
                    <span className="glass-chip">
                      <Clock className="h-3 w-3" /> {fullTemplates[0].durationMin}分
                    </span>
                    <span className="glass-chip">
                      <Target className="h-3 w-3" /> オリジナル問題のみ
                    </span>
                    <span className="glass-chip">
                      <Flame className="h-3 w-3" /> 苦手重み付け
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-white text-ios-red shadow-ios">
                  <PlayCircle className="h-6 w-6" strokeWidth={2.2} />
                </div>
              </div>
              <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            </button>
          </form>
        </section>
      )}

      {/* ── Past-exam drills (verbatim IPA) ────────── */}
      {pastExamTemplates.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            kicker="Past Papers"
            title="年度別過去問"
            sub="IPA公開問題を逐語出題 (原典まま)"
            viewAllHref="/learn/past-exams"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {pastExamTemplates.map((t) => {
              if (t.filter.kind !== "year") return null;
              const y = t.filter.examYear;
              const season = t.filter.examSeason;
              const locked = !isTplAvailable(t);
              const source = pastExams.find(
                (p) =>
                  p.examYear === y &&
                  (season === undefined || p.examSeason === season)
              );
              return (
                <YearAlbumTile
                  key={t.slug}
                  template={t}
                  year={y}
                  label={source?.shortLabel ?? `R${y}`}
                  coverage={source?.coveragePct ?? 0}
                  imported={source?.importedCount ?? 0}
                  total={source?.totalQuestions ?? 100}
                  locked={locked}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ── Category cards (original mock, by field) ─ */}
      <section className="space-y-3">
        <SectionHeader
          kicker="By Field"
          title="分野別模試"
          sub="オリジナル問題 / 3大領域に絞って強化"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {categoryTemplates.map((t) => {
            if (t.filter.kind !== "category") return null;
            const meta = CATEGORY_META[t.filter.majorCategory];
            const locked = !isTplAvailable(t);
            return (
              <CategoryTile
                key={t.slug}
                template={t}
                grad={meta.grad}
                label={meta.label}
                kana={meta.kana}
                emoji={meta.emoji}
                locked={locked}
              />
            );
          })}
        </div>
      </section>

      {/* ── Size variants (compact chip row) ──────── */}
      <section className="space-y-3">
        <SectionHeader
          kicker="Quick Start"
          title="サイズを選ぶ"
          sub="オリジナル問題 / 全範囲ランダム / 毎回違う出題"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fullTemplates.map((t) => {
            const locked = !isTplAvailable(t);
            return (
              <QuickSizeTile key={t.slug} template={t} locked={locked} />
            );
          })}
          <form action={startMockExam}>
            <input type="hidden" name="count" value={50} />
            <button
              type="submit"
              className="flex h-full w-full flex-col gap-2 rounded-3xl bg-card p-4 text-left shadow-surface ring-1 ring-black/5 transition-transform active:scale-[0.98] dark:ring-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-grad-green text-white shadow-tile">
                  <Zap className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Quick
                </span>
              </div>
              <div>
                <div className="num text-[24px] font-semibold tracking-tight">
                  50<span className="text-[14px] text-muted-foreground">問</span>
                </div>
                <div className="text-[12px] text-muted-foreground">
                  時短 60分
                </div>
              </div>
            </button>
          </form>
        </div>
      </section>

      {/* ── Archive CTA ──────────────────────────── */}
      <Link
        href="/learn/past-exams"
        className="surface-card group flex items-center gap-4 p-5 transition-transform active:scale-[0.99]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-ink text-white shadow-tile">
          <Archive className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Archive
          </div>
          <div className="text-[16px] font-semibold">
            過去問アーカイブを見る
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            収録 {pastExams.length} 回 · IPA公開問題 · 出典つき
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* ── Rules (condensed pills) ─────────────── */}
      <section className="surface-card p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <Gauge className="h-3.5 w-3.5" /> Rules
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          <RulePill>年度別過去問=IPA公開問題そのまま / 模試=本サイトのオリジナル問題</RulePill>
          <RulePill>解答数はカウント対象外 (無制限)</RulePill>
          <RulePill>タイムアップで自動集計</RulePill>
          <RulePill>中断→再開可 (残時間は非保存)</RulePill>
        </ul>
      </section>
    </div>
  );
}

// ---- Components -----------------------------------------------------------

function SectionHeader({
  kicker,
  title,
  sub,
  viewAllHref,
}: {
  kicker: string;
  title: string;
  sub?: string;
  viewAllHref?: string;
}) {
  return (
    <div className="flex items-end justify-between px-1">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {kicker}
        </div>
        <div className="mt-0.5 text-[19px] font-semibold tracking-tight">
          {title}
        </div>
        {sub && (
          <div className="text-[12px] text-muted-foreground">{sub}</div>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-muted-foreground active:opacity-70"
        >
          すべて <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function YearAlbumTile({
  template,
  year,
  label,
  coverage,
  imported,
  total,
  locked,
}: {
  template: MockExamTemplate;
  year: number;
  label: string;
  coverage: number;
  imported: number;
  total: number;
  locked: boolean;
}) {
  const grad = YEAR_GRAD[year] ?? "bg-grad-ink";
  const glyph = YEAR_GLYPH[year] ?? `R${year}`;

  const content = (
    <>
      {/* Huge decorative year glyph */}
      <div
        aria-hidden
        className="album-glyph pointer-events-none absolute right-[-10%] top-[-12%] text-[160px] opacity-[0.18] sm:text-[180px]"
      >
        {glyph}
      </div>
      <div className="relative z-10 flex items-start justify-between">
        <span className="glass-chip">
          {template.sourceType === "past_exam" ? "過去問そのまま" : "オリジナル"}
        </span>
        {locked ? (
          <Lock className="h-4 w-4 opacity-85" />
        ) : (
          <PlayCircle className="h-5 w-5 opacity-90" />
        )}
      </div>
      <div className="relative z-10 mt-auto space-y-1">
        <div className="album-glyph text-[48px]">{label}</div>
        <div className="text-[12px] font-medium opacity-90">
          {template.count}問 · {template.durationMin}分
        </div>
        {!locked && (
          <div>
            <div className="cat-stripe">
              <div
                className="h-full bg-white"
                style={{ width: `${Math.max(2, Math.min(100, coverage))}%` }}
              />
            </div>
            <div className="mt-1 flex items-baseline justify-between text-[10.5px] opacity-90">
              <span>収録 {imported}/{total}</span>
              <span className="num font-medium">{coverage}%</span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (locked) {
    return (
      <Link
        href="/pricing?reason=mock_exam"
        className={`album-tile ${grad} grayscale-[0.15]`}
      >
        {content}
      </Link>
    );
  }

  return (
    <form action={startMockExamFromTemplate} className="contents">
      <input type="hidden" name="template" value={template.slug} />
      <button type="submit" className={`album-tile ${grad} text-left`}>
        {content}
      </button>
    </form>
  );
}

function CategoryTile({
  template,
  grad,
  label,
  kana,
  emoji,
  locked,
}: {
  template: MockExamTemplate;
  grad: string;
  label: string;
  kana: string;
  emoji: string;
  locked: boolean;
}) {
  const content = (
    <>
      <div className="relative z-10 flex items-start justify-between">
        <span
          aria-hidden
          className="text-[44px] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
        >
          {emoji}
        </span>
        {locked ? (
          <Lock className="h-4 w-4 opacity-85" />
        ) : (
          <PlayCircle className="h-5 w-5 opacity-90" />
        )}
      </div>
      <div className="relative z-10 mt-auto">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-85">
          {label}
        </div>
        <div className="mt-0.5 text-[22px] font-semibold tracking-tight">
          {kana}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11.5px] opacity-90">
          <span className="glass-chip">
            <Layers className="h-3 w-3" />
            {template.count}問
          </span>
          <span className="glass-chip">
            <Clock className="h-3 w-3" />
            {template.durationMin}分
          </span>
        </div>
      </div>
    </>
  );

  if (locked) {
    return (
      <Link
        href="/pricing?reason=mock_exam"
        className={`album-tile ${grad} !aspect-[16/10] grayscale-[0.15]`}
      >
        {content}
      </Link>
    );
  }

  return (
    <form action={startMockExamFromTemplate} className="contents">
      <input type="hidden" name="template" value={template.slug} />
      <button
        type="submit"
        className={`album-tile ${grad} !aspect-[16/10] text-left`}
      >
        {content}
      </button>
    </form>
  );
}

function QuickSizeTile({
  template,
  locked,
}: {
  template: MockExamTemplate;
  locked: boolean;
}) {
  const Icon = template.tier === "premium" ? Crown : Sparkles;
  const grad =
    template.count >= 200
      ? "bg-grad-ink"
      : template.count >= 150
      ? "bg-grad-purple"
      : "bg-grad-blue";

  const body = (
    <>
      <div className="flex items-center justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${grad} text-white shadow-tile`}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        {locked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Lock className="h-3 w-3" />
            {template.tier === "premium" ? "Premium" : "上位"}
          </span>
        )}
      </div>
      <div>
        <div className="num text-[24px] font-semibold tracking-tight">
          {template.count}
          <span className="text-[14px] text-muted-foreground">問</span>
        </div>
        <div className="text-[12px] text-muted-foreground">
          {template.durationMin}分 {template.badge && `· ${template.badge}`}
        </div>
      </div>
    </>
  );

  if (locked) {
    return (
      <Link
        href="/pricing?reason=mock_exam"
        className="flex h-full flex-col gap-2 rounded-3xl bg-card p-4 opacity-75 shadow-surface ring-1 ring-black/5 transition-transform active:scale-[0.98] dark:ring-white/10"
      >
        {body}
      </Link>
    );
  }

  return (
    <form action={startMockExamFromTemplate} className="contents">
      <input type="hidden" name="template" value={template.slug} />
      <button
        type="submit"
        className="flex h-full w-full flex-col gap-2 rounded-3xl bg-card p-4 text-left shadow-surface ring-1 ring-black/5 transition-transform active:scale-[0.98] dark:ring-white/10"
      >
        {body}
      </button>
    </form>
  );
}

function ErrorBanner({
  children,
  tone = "yellow",
}: {
  children: React.ReactNode;
  tone?: "yellow" | "red";
}) {
  const c =
    tone === "red"
      ? "bg-ios-red/10 text-ios-red"
      : "bg-ios-yellow/10 text-ios-orange";
  return (
    <div
      className={`rounded-2xl px-4 py-3 text-[13px] shadow-ios-sm ${c}`}
    >
      {children}
    </div>
  );
}

function RulePill({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 rounded-xl bg-muted/60 px-3 py-2 text-[12.5px]">
      <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}

// ---- Server actions -------------------------------------------------------

async function startMockExam(formData: FormData): Promise<void> {
  "use server";
  const count = Number(formData.get("count") ?? 100);
  const res = await createSessionAction({
    mode: "mixed",
    count,
    mockExam: true,
  });
  if (res && !res.ok) {
    if (res.reason === "mock_exam_locked") redirect("/pricing?reason=mock_exam");
    if (res.reason === "mock_exam_size_locked")
      redirect("/learn/mock-exam?error=size_locked");
    redirect("/learn/mock-exam?error=empty");
  }
}

async function startMockExamFromTemplate(formData: FormData): Promise<void> {
  "use server";
  const template = String(formData.get("template") ?? "");
  const res = await createMockExamFromTemplateAction({ templateSlug: template });
  if (res && !res.ok) {
    if (res.reason === "mock_exam_locked") redirect("/pricing?reason=mock_exam");
    if (res.reason === "mock_exam_size_locked")
      redirect("/learn/mock-exam?error=size_locked");
    if (res.reason === "year_locked")
      redirect("/learn/mock-exam?error=year_locked");
    redirect("/learn/mock-exam?error=empty");
  }
}
