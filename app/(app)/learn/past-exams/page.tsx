import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Lock,
  Play,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import {
  hasFeature,
  minAllowedExamYear,
  planLabel,
} from "@/lib/plan";
import { listPastExams, type PastExamSummary } from "@/server/queries/pastExams";
import { createSessionAction } from "@/server/actions/sessions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "過去問アーカイブ",
  description: "ITパスポート試験 (IPA) 公開問題の収録状況と、回別・分野別模試。",
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

  return (
    <div className="space-y-6">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground active:opacity-70"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        学習トップへ
      </Link>

      <header className="pt-1">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Archive
        </div>
        <h1 className="mt-1.5 text-ios-large font-semibold">過去問アーカイブ</h1>
        <p className="mt-1 text-[14px] text-muted-foreground text-pretty">
          IPA が公開している ITパスポート試験の過去問をもとに、構造化データとして収録した一覧。
          各問題には出典 (年度・問番号) を明記しています。
        </p>
      </header>

      {sp.error === "year_locked" && (
        <div className="rounded-2xl bg-ios-yellow/10 px-4 py-3 text-[13px] text-ios-orange shadow-ios-sm">
          この年度は{planLabel(plan)}では未解放です。Premiumで全年度にアクセスできます。
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="surface-card p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-grad-ocean text-white">
              <Archive className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Sources
              </div>
              <div className="text-[18px] font-semibold">
                {exams.length} 回分の過去問を収録
              </div>
              <div className="text-[12px] text-muted-foreground">
                原典: IPA 公開PDF · 出典表記つき
              </div>
            </div>
          </div>
        </div>
        <div className="surface-card p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-grad-sunset text-white">
              <FileText className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Questions
              </div>
              <div className="text-[18px] font-semibold">
                <span className="num">{totalImported}</span>
                <span className="text-[13px] text-muted-foreground">
                  {" "}/ {totalAvailable} 問を構造化済み
                </span>
              </div>
              <div className="text-[12px] text-muted-foreground">
                残りは順次構造化 (whyAttractive/解説入り)
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <div className="ios-section-label">収録済みの過去問</div>
        <div className="space-y-3">
          {exams.map((e) => (
            <ExamCard
              key={e.slug}
              exam={e}
              canMock={canMock}
              locked={minYear != null && e.examYear < minYear}
            />
          ))}
        </div>
      </section>

      <section className="surface-card p-4">
        <div className="text-[12.5px] text-muted-foreground text-pretty">
          出典の扱いについて: 本アプリは IPA 公開PDFを元に、
          設問・選択肢を構造化データとして取り込んでいます。
          原典の文言を引用する際は各問題に <code className="rounded bg-muted px-1">出典：令和X年度 ...</code>
          の形で明記します (詳細は <Link href="/legal" className="underline">LEGAL</Link>)。
        </div>
      </section>
    </div>
  );
}

function ExamCard({
  exam,
  canMock,
  locked,
}: {
  exam: PastExamSummary;
  canMock: boolean;
  locked: boolean;
}) {
  const pct = Math.min(100, Math.max(0, exam.coveragePct));
  const seasonLabel =
    exam.examSeason === "autumn"
      ? "秋"
      : exam.examSeason === "spring"
      ? "春"
      : "";

  return (
    <div className="surface-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grad-ink text-white">
          <FileText className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px] font-semibold">
              {exam.shortLabel}
              {seasonLabel && <span className="ml-1 text-muted-foreground">({seasonLabel})</span>}
            </span>
            {locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Lock className="h-3 w-3" />
                上位プラン
              </span>
            )}
          </div>
          <div className="text-[12.5px] text-muted-foreground">
            {exam.label}
          </div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            {exam.issuer}
          </div>
        </div>
        <a
          href={exam.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] text-muted-foreground active:opacity-70"
        >
          原典
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
          <span>
            構造化収録 <span className="num font-medium text-foreground">{exam.importedCount}</span>
            {" "}/ {exam.totalQuestions} 問
          </span>
          <span className="num">{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
      </div>

      {exam.importedCount > 0 && (
        <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
          <div className="rounded-lg bg-muted/60 px-2 py-1">
            <span className="font-medium text-foreground">
              {exam.categoryCounts.strategy}
            </span>{" "}
            ストラテジ
          </div>
          <div className="rounded-lg bg-muted/60 px-2 py-1">
            <span className="font-medium text-foreground">
              {exam.categoryCounts.management}
            </span>{" "}
            マネジメント
          </div>
          <div className="rounded-lg bg-muted/60 px-2 py-1">
            <span className="font-medium text-foreground">
              {exam.categoryCounts.technology}
            </span>{" "}
            テクノロジ
          </div>
        </div>
      )}

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
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-[13px] font-semibold text-primary-foreground active:opacity-80"
            >
              <Play className="h-3.5 w-3.5" />
              この回で模試
            </button>
          </form>
        )}
        <Link
          href={`/learn/session/new?mode=year&year=${exam.examYear}&count=5`}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-muted text-[13px] font-semibold text-foreground active:opacity-80"
        >
          5問だけ解く
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
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
    if (res.reason === "year_locked") redirect("/learn/past-exams?error=year_locked");
    if (res.reason === "mock_exam_size_locked")
      redirect("/learn/past-exams?error=size_locked");
    redirect("/learn/past-exams?error=empty");
  }
}
