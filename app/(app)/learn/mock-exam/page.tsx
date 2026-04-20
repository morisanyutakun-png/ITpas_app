import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  ChevronRight,
  Clock,
  Crown,
  Lock,
  Sparkles,
  Target,
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
  const pastExams = await listPastExams({ minYear });
  const templates = getMockExamTemplates();

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md space-y-5 pt-6">
        <div className="rounded-3xl bg-card p-6 text-center shadow-ios-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ios-orange/10 text-ios-orange">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-ios-title3 font-semibold">
            模擬試験は Pro で解放されます
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            本番形式 100問 × 120分。時間配分と踏みとどまり方を鍛えます。
          </p>
          <Link
            href="/pricing?reason=mock_exam"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground active:opacity-80"
          >
            プランを見る
          </Link>
        </div>
      </div>
    );
  }

  // Bucket templates by purpose
  const fullTemplates = templates.filter((t) => t.filter.kind === "all" && t.count >= 50);
  const yearTemplates = templates.filter((t) => t.filter.kind === "year");
  const categoryTemplates = templates.filter((t) => t.filter.kind === "category");

  const isTplAvailable = (t: MockExamTemplate) => {
    if (t.count > maxSize) return false;
    if (t.tier === "premium" && !premium) return false;
    if (t.filter.kind === "year" && minYear != null && t.filter.examYear < minYear) {
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <h1 className="text-ios-title1 font-semibold">模擬試験</h1>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          本試験形式 {MOCK_EXAM_DURATION_MIN}分 · 過去問プール {pastExams.length}回分
        </p>
      </header>

      {sp.error === "size_locked" && (
        <div className="rounded-2xl bg-ios-yellow/10 px-4 py-3 text-[13px] text-ios-orange shadow-ios-sm">
          選択したサイズは{planLabel(plan)}では利用できません (最大{maxSize}問)。
        </div>
      )}
      {sp.error === "year_locked" && (
        <div className="rounded-2xl bg-ios-yellow/10 px-4 py-3 text-[13px] text-ios-orange shadow-ios-sm">
          この年度は{planLabel(plan)}では解放されていません。Premiumで全年度にアクセスできます。
        </div>
      )}
      {sp.error === "empty" && (
        <div className="rounded-2xl bg-ios-red/10 px-4 py-3 text-[13px] text-ios-red shadow-ios-sm">
          条件に合致する問題がありません。プールが増えるまで別のテンプレートをお試しください。
        </div>
      )}

      <section className="space-y-2">
        <div className="ios-section-label">本番形式</div>
        <div className="ios-list shadow-ios-sm">
          {fullTemplates.map((t) => (
            <TemplateRow
              key={t.slug}
              template={t}
              locked={!isTplAvailable(t)}
              maxSize={maxSize}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="ios-section-label">年度別模試</div>
        <div className="ios-list shadow-ios-sm">
          {yearTemplates.map((t) => (
            <TemplateRow
              key={t.slug}
              template={t}
              locked={!isTplAvailable(t)}
              maxSize={maxSize}
            />
          ))}
        </div>
        <div className="px-3 text-[11.5px] text-muted-foreground">
          各回の出典は IPA 公開 PDF。構造化データとして取り込まれた問題から出題。
        </div>
      </section>

      <section className="space-y-2">
        <div className="ios-section-label">分野別模試</div>
        <div className="ios-list shadow-ios-sm">
          {categoryTemplates.map((t) => (
            <TemplateRow
              key={t.slug}
              template={t}
              locked={!isTplAvailable(t)}
              maxSize={maxSize}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="ios-section-label">カスタム (ランダム再抽選)</div>
        <div className="ios-list shadow-ios-sm">
          {[100, 150, 200]
            .filter((n) => n <= maxSize)
            .map((n) => (
              <form key={n} action={startMockExam} className="contents">
                <input type="hidden" name="count" value={n} />
                <button
                  type="submit"
                  className="ios-row w-full text-left active:bg-muted/60"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Sparkles className="h-4 w-4 text-ios-blue" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-medium">
                      ランダム{n}問 / {MOCK_EXAM_DURATION_MIN}分
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      毎回違う抽選。苦手重みもゆるく効きます。
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </form>
            ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="ios-section-label">出典となる過去問</div>
        <Link href="/learn/past-exams" className="ios-row shadow-ios-sm active:bg-muted/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Archive className="h-4 w-4 text-ios-indigo" strokeWidth={2.2} />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-medium">過去問アーカイブを見る</div>
            <div className="text-[12px] text-muted-foreground">
              収録済み {pastExams.length} 回分 · IPA公開問題への出典つき
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>

      <section className="space-y-2">
        <div className="ios-section-label">ルール</div>
        <div className="ios-list shadow-ios-sm">
          <Rule text="解答はプラン制限を受けず、何問でも進められます" />
          <Rule text="タイマーがゼロになると結果画面へ自動遷移します" />
          <Rule text="ブラウザを閉じても途中から再開できます (残り時間は保存されません)" />
          <Rule text="出題は構造化された IPA 公開問題に基づき、各問ごとに出典を表示" />
        </div>
      </section>
    </div>
  );
}

function TemplateRow({
  template,
  locked,
  maxSize,
}: {
  template: MockExamTemplate;
  locked: boolean;
  maxSize: number;
}) {
  const ActionIcon = template.tier === "premium" ? Crown : Target;
  const iconColor =
    template.tier === "premium" ? "text-ios-purple" : "text-ios-blue";

  if (locked) {
    return (
      <Link
        href="/pricing?reason=mock_exam"
        className="ios-row w-full text-left active:bg-muted/60"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Lock className="h-4 w-4 text-muted-foreground" strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-[15px] font-medium">
            <span>{template.label}</span>
            {template.badge && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {template.badge}
              </span>
            )}
          </div>
          <div className="text-[12px] text-muted-foreground">
            {template.count > maxSize
              ? `最大${maxSize}問まで / 上位プランで解放`
              : "上位プランで解放"}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    );
  }

  return (
    <form action={startMockExamFromTemplate} className="contents">
      <input type="hidden" name="template" value={template.slug} />
      <button
        type="submit"
        className="ios-row w-full text-left active:bg-muted/60"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <ActionIcon className={`h-4 w-4 ${iconColor}`} strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-[15px] font-medium">
            <span>{template.label}</span>
            {template.badge && (
              <span className="rounded-full bg-ios-blue/10 px-1.5 py-0.5 text-[10px] font-medium text-ios-blue">
                {template.badge}
              </span>
            )}
          </div>
          <div className="text-[12px] text-muted-foreground">
            {template.count}問 / {template.durationMin}分 · {template.description}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </form>
  );
}

function Rule({ text }: { text: string }) {
  return (
    <div className="ios-row items-start">
      <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ios-gray2" />
      <span className="text-[13px] text-muted-foreground">{text}</span>
    </div>
  );
}

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
