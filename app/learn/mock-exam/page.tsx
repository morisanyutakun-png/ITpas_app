import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, Crown, Lock, Sparkles, Target } from "lucide-react";
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
      <div className="mx-auto max-w-md rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-8 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold">模擬試験はProプラン以上で解放されます</h1>
        <p className="text-sm text-slate-600">
          本番形式の100問×120分シミュレーション。時間配分と踏みとどまり方を鍛えます。
        </p>
        <Link
          href="/pricing?reason=mock_exam"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 font-bold text-white shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          Proを見る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          <Target className="h-3.5 w-3.5" />
          模擬試験モード
        </div>
        <h1 className="text-3xl font-black tracking-tight">本番形式で力試し</h1>
        <p className="text-sm text-slate-600">
          問題構成は重み付きランダム、時間は{MOCK_EXAM_DURATION_MIN}分。一度始めたら最後まで。
        </p>
      </div>

      {sp.error === "size_locked" && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          選択したサイズは現在のプランでは利用できません ({planLabel(plan)}: 最大{maxSize}問)。
        </div>
      )}

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-slate-500" />
          <span>制限時間 <strong>{MOCK_EXAM_DURATION_MIN}分</strong></span>
        </div>
        <div className="text-xs text-slate-500">
          問題範囲: {planLabel(plan)}プランで解放されている全年度から出題されます。
        </div>

        <div className="grid gap-2">
          {sizes.map((n) => (
            <form key={n} action={startMockExam}>
              <input type="hidden" name="count" value={n} />
              <button
                type="submit"
                className={`flex w-full items-center justify-between rounded-xl border-2 px-5 py-4 text-left transition ${
                  n <= maxSize
                    ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                    : "border-violet-300 bg-violet-50 text-violet-900 hover:border-violet-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    {n > maxSize ? (
                      <Crown className="h-5 w-5 text-violet-600" />
                    ) : (
                      <Target className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-black tracking-tight">{n}問 / {MOCK_EXAM_DURATION_MIN}分</div>
                    <div className="text-xs opacity-80">
                      {n === 100
                        ? "本試験と同じ規模"
                        : n === 150
                        ? "追い込み用"
                        : "極限演習"}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold">
                  {n > maxSize ? "Premium →" : "開始 →"}
                </span>
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
        <div className="font-bold text-slate-800">ルール</div>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>解答中は Pro/Premium の1日回答数カウントに含まれます (上限は無制限です)。</li>
          <li>タイマーがゼロになるとセッション結果画面へ自動遷移します。</li>
          <li>ブラウザを閉じても途中から再開できます (残り時間は保存されません)。</li>
        </ul>
      </div>
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
    if (res.reason === "mock_exam_size_locked") redirect("/learn/mock-exam?error=size_locked");
    redirect("/learn/mock-exam?error=empty");
  }
}
