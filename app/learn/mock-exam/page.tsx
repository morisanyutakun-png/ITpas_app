import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Clock, Crown, Lock, Target } from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import {
  hasFeature,
  isPremium,
  limitsFor,
  MOCK_EXAM_DURATION_MIN,
  planLabel,
} from "@/lib/plan";
import { createSessionAction } from "@/server/actions/sessions";

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

  const sizes = premium ? [100, 150, 200] : [100];

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

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <h1 className="text-ios-title1 font-semibold">模擬試験</h1>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          制限時間 {MOCK_EXAM_DURATION_MIN}分 · 全問必須
        </p>
      </header>

      {sp.error === "size_locked" && (
        <div className="rounded-2xl bg-ios-yellow/10 px-4 py-3 text-[13px] text-ios-orange shadow-ios-sm">
          選択したサイズは{planLabel(plan)}では利用できません (最大{maxSize}問)。
        </div>
      )}

      <section className="space-y-2">
        <div className="ios-section-label">問題数を選ぶ</div>
        <div className="ios-list shadow-ios-sm">
          {sizes.map((n) => {
            const locked = n > maxSize;
            return (
              <form key={n} action={startMockExam} className="contents">
                <input type="hidden" name="count" value={n} />
                <button
                  type="submit"
                  className="ios-row w-full text-left active:bg-muted/60"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    {locked ? (
                      <Crown className="h-4 w-4 text-ios-purple" />
                    ) : (
                      <Target className="h-4 w-4 text-ios-blue" strokeWidth={2.2} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-medium">
                      {n}問 / {MOCK_EXAM_DURATION_MIN}分
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      {n === 100
                        ? "本試験と同じ規模"
                        : n === 150
                        ? "追い込み用"
                        : "極限演習"}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <div className="ios-section-label">ルール</div>
        <div className="ios-list shadow-ios-sm">
          <Rule text="回答数は Pro/Premium の1日カウントに含まれます (上限は無制限)" />
          <Rule text="タイマーがゼロになると結果画面へ自動遷移します" />
          <Rule text="ブラウザを閉じても途中から再開できます (残り時間は保存されません)" />
        </div>
      </section>
    </div>
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
