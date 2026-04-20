import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Layers,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { hasFeature, minAllowedExamYear, planLabel } from "@/lib/plan";
import {
  listPastExams,
  type PastExamSummary,
} from "@/server/queries/pastExams";
import { createSessionAction } from "@/server/actions/sessions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "過去問アーカイブ",
  description:
    "ITパスポート試験 (IPA) 公開問題の収録状況と、回別・分野別模試。",
};

const YEAR_GRAD: Record<number, string> = {
  7: "bg-grad-r07",
  6: "bg-grad-r06",
  5: "bg-grad-r05",
  2: "bg-grad-r02",
  1: "bg-grad-r01",
};

export default async function PastExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const user = await readCurrentUser();
  const plan = user?.plan ?? "free";
  const minYear = await minAllowedExamYear(plan);
  const exams = await listPastExams();
  const canMock = hasFeature(user, "mockExam");

  const totalImported = exams.reduce((a, e) => a + e.importedCount, 0);
  const totalAvailable = exams.reduce((a, e) => a + e.totalQuestions, 0);
  const overallPct =
    totalAvailable > 0
      ? Math.round((totalImported / totalAvailable) * 100)
      : 0;

  return (
    <div className="space-y-8 pb-8">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground active:opacity-70"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        学習トップへ
      </Link>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-grad-ink p-6 text-white shadow-hero sm:p-8">
        <div className="relative z-10 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-85">
              <Archive className="h-3.5 w-3.5" />
              Past Paper Archive
            </div>
            <h1 className="text-[30px] font-semibold leading-tight tracking-tight sm:text-[36px]">
              IPA 公開問題
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#FF9500] via-[#FF375F] to-[#AF52DE] bg-clip-text text-transparent">
                {exams.length} 回分
              </span>
              を完全収録
            </h1>
            <p className="max-w-md text-[13.5px] opacity-85 text-pretty">
              公式PDF原典へのリンクと出典明記つき。
              各問題は構造化データとして取り込まれ、年度別・分野別に模試を組めます。
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="glass-chip">
                <FileText className="h-3 w-3" /> 原典 IPA 公開 PDF
              </span>
              <span className="glass-chip">
                <ShieldCheck className="h-3 w-3" /> 出典明記
              </span>
              <span className="glass-chip">
                <Sparkles className="h-3 w-3" /> 誤答解説つき
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="coverage-ring"
              style={
                {
                  "--p": overallPct,
                  "--size": "96px",
                  "--thick": "8px",
                } as React.CSSProperties
              }
            >
              <span className="text-center">
                <span className="num block text-[22px] font-semibold leading-none">
                  {overallPct}
                </span>
                <span className="text-[10px] opacity-85">%</span>
              </span>
            </div>
            <div className="text-[12px] leading-tight opacity-85">
              <div className="font-medium">構造化進捗</div>
              <div className="num text-[14px] font-semibold text-white">
                {totalImported}
                <span className="text-[12px] opacity-70"> / {totalAvailable}</span>
              </div>
              <div className="text-[10.5px] opacity-70">問</div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ios-red/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-20 h-56 w-56 rounded-full bg-ios-purple/25 blur-3xl" />
      </section>

      {sp.error === "year_locked" && (
        <div className="rounded-2xl bg-ios-yellow/10 px-4 py-3 text-[13px] text-ios-orange shadow-ios-sm">
          この年度は{planLabel(plan)}では未解放です。Premiumで全年度にアクセスできます。
        </div>
      )}

      {/* ── Exam grid (album art style) ───────── */}
      <section className="space-y-3">
        <div className="px-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Collection
          </div>
          <div className="mt-0.5 text-[19px] font-semibold tracking-tight">
            収録済みの過去問
          </div>
          <div className="text-[12px] text-muted-foreground">
            タップで5問だけ解く / 本格模試ボタンでフル出題
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => (
            <ExamAlbumCard
              key={e.slug}
              exam={e}
              canMock={canMock}
              locked={minYear != null && e.examYear < minYear}
            />
          ))}
        </div>
      </section>

      {/* ── Source disclosure ────────────────── */}
      <section className="surface-card space-y-2 p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Sources & Credit
        </div>
        <p className="text-[12.5px] text-muted-foreground leading-relaxed">
          本アプリは IPA (独立行政法人 情報処理推進機構) が公開している
          ITパスポート試験の公開問題 PDF を原典とし、
          設問・選択肢を構造化データとして取り込んでいます。
          原典の文言を引用する際は各問題に <code className="rounded bg-muted px-1 text-[11px]">出典：令和X年度 ...</code>
          の形で明記します。詳細は <Link href="/legal" className="underline">LEGAL</Link> を参照。
        </p>
      </section>
    </div>
  );
}

function ExamAlbumCard({
  exam,
  canMock,
  locked,
}: {
  exam: PastExamSummary;
  canMock: boolean;
  locked: boolean;
}) {
  const pct = Math.min(100, Math.max(0, exam.coveragePct));
  const grad = YEAR_GRAD[exam.examYear] ?? "bg-grad-ink";
  const seasonLabel =
    exam.examSeason === "autumn"
      ? "秋"
      : exam.examSeason === "spring"
      ? "春"
      : "";
  const glyph = `R${exam.examYear}`;

  const totalCat =
    exam.categoryCounts.strategy +
      exam.categoryCounts.management +
      exam.categoryCounts.technology || 1;
  const stratPct = (exam.categoryCounts.strategy / totalCat) * 100;
  const mgmtPct = (exam.categoryCounts.management / totalCat) * 100;
  const techPct = (exam.categoryCounts.technology / totalCat) * 100;

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl shadow-hero ring-1 ring-black/5 dark:ring-white/10 ${
        locked ? "opacity-90 grayscale-[0.2]" : ""
      }`}
    >
      {/* Top: album-art visual */}
      <div className={`relative aspect-[16/9] ${grad} p-4 text-white`}>
        <div
          aria-hidden
          className="album-glyph pointer-events-none absolute right-[-6%] top-[-20%] text-[160px] opacity-[0.22]"
        >
          {glyph}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.25), transparent 55%), radial-gradient(100% 80% at 0% 100%, rgba(0,0,0,0.25), transparent 50%)",
          }}
        />
        <div className="relative z-10 flex items-start justify-between">
          <span className="glass-chip">
            <FileText className="h-3 w-3" />
            IPA 原典PDF
          </span>
          <div
            className="coverage-ring"
            style={
              {
                "--p": pct,
                "--size": "52px",
                "--thick": "5px",
              } as React.CSSProperties
            }
          >
            <span className="text-center">
              <span className="num block text-[11px] font-semibold leading-none">
                {pct}
              </span>
              <span className="text-[8px] opacity-80">%</span>
            </span>
          </div>
        </div>
        <div className="relative z-10 mt-3">
          <div className="album-glyph text-[44px]">
            {exam.shortLabel}
            {seasonLabel && (
              <span className="ml-1 text-[26px] opacity-85">({seasonLabel})</span>
            )}
          </div>
          <div className="mt-0.5 text-[11.5px] font-medium opacity-90">
            {exam.label}
          </div>
        </div>
        {locked && (
          <span className="absolute right-3 bottom-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
            <Lock className="h-3 w-3" />
            Premium
          </span>
        )}
      </div>

      {/* Bottom: meta + actions */}
      <div className="space-y-3 bg-card p-4">
        <div>
          <div className="flex items-baseline justify-between text-[11.5px] text-muted-foreground">
            <span>
              構造化{" "}
              <span className="num font-medium text-foreground">
                {exam.importedCount}
              </span>
              <span className="opacity-70"> / {exam.totalQuestions} 問</span>
            </span>
            <a
              href={exam.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground active:opacity-70"
            >
              原典
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {/* Category distribution stripe */}
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-grad-strategy"
              style={{ width: `${stratPct}%` }}
            />
            <div
              className="h-full bg-grad-management"
              style={{ width: `${mgmtPct}%` }}
            />
            <div
              className="h-full bg-grad-technology"
              style={{ width: `${techPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
            <CatDot
              color="bg-grad-strategy"
              label="戦"
              n={exam.categoryCounts.strategy}
            />
            <CatDot
              color="bg-grad-management"
              label="管"
              n={exam.categoryCounts.management}
            />
            <CatDot
              color="bg-grad-technology"
              label="技"
              n={exam.categoryCounts.technology}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {canMock && !locked && exam.importedCount > 0 && (
            <form action={startYearMockExam} className="flex-1">
              <input type="hidden" name="examYear" value={exam.examYear} />
              <input
                type="hidden"
                name="count"
                value={Math.max(10, Math.min(100, exam.importedCount))}
              />
              <button
                type="submit"
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-foreground text-[12.5px] font-semibold text-background shadow-ios active:scale-[0.98]"
              >
                <PlayCircle className="h-4 w-4" />
                この回で模試
              </button>
            </form>
          )}
          <Link
            href={
              exam.importedCount > 0 && !locked
                ? `/learn/session/new?mode=year&year=${exam.examYear}&count=5`
                : "#"
            }
            aria-disabled={exam.importedCount === 0 || locked}
            className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-muted text-[12.5px] font-semibold text-foreground active:opacity-80 ${
              exam.importedCount === 0 || locked
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            <Layers className="h-4 w-4" />
            5問だけ
          </Link>
        </div>
      </div>
    </div>
  );
}

function CatDot({
  color,
  label,
  n,
}: {
  color: string;
  label: string;
  n: number;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      <span>
        {label}
        <span className="num ml-0.5 font-medium text-foreground">{n}</span>
      </span>
    </span>
  );
}

async function startYearMockExam(formData: FormData): Promise<void> {
  "use server";
  const examYear = Number(formData.get("examYear"));
  const count = Number(formData.get("count") ?? 100);
  const res = await createSessionAction({
    mode: "mixed",
    filters: { examYear },
    count,
    mockExam: true,
  });
  if (res && !res.ok) {
    if (res.reason === "mock_exam_locked") redirect("/pricing?reason=mock_exam");
    if (res.reason === "year_locked")
      redirect("/learn/past-exams?error=year_locked");
    if (res.reason === "mock_exam_size_locked")
      redirect("/learn/past-exams?error=size_locked");
    redirect("/learn/past-exams?error=empty");
  }
}
