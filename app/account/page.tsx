import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { readCurrentUser } from "@/lib/currentUser";
import { getDailyAttemptCount, isPro, limitsFor, PLAN_LIMITS } from "@/lib/plan";
import { openBillingPortalAction } from "@/server/actions/checkout";
import { CheckCircle2, LogOut, Sparkles, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; portal?: string }>;
}) {
  const sp = await searchParams;
  const user = await readCurrentUser();

  if (!user || !user.isSignedIn) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border-2 border-slate-200 bg-white p-8 text-center space-y-4">
        <User className="mx-auto h-10 w-10 text-slate-400" />
        <h1 className="text-xl font-bold">アカウント</h1>
        <p className="text-sm text-slate-600">
          進捗を端末をまたいで保存し、Proプランを使うにはGoogleでログインしてください。
        </p>
        <Link
          href="/api/auth/google/login?returnTo=/account"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white shadow-lg transition hover:bg-slate-800"
        >
          Googleでログイン
        </Link>
      </div>
    );
  }

  const pro = isPro(user);
  const [usedToday, totalsRow] = await Promise.all([
    getDailyAttemptCount(user.id),
    db.execute(sql`
      SELECT COUNT(*)::int AS total,
             SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END)::int AS correct
      FROM attempts WHERE user_id = ${user.id}
    `),
  ]);
  const totals = (totalsRow.rows[0] ?? {}) as { total?: number; correct?: number };
  const total = Number(totals.total ?? 0);
  const correct = Number(totals.correct ?? 0);

  const dailyLimit = limitsFor(user.plan).dailyQuestionAttempts;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {sp.upgraded && (
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Proへのアップグレードが完了しました！ありがとうございます。
        </div>
      )}
      {sp.portal === "no_customer" && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Stripeの課金情報がまだ関連付けられていません。先にProへアップグレードしてください。
        </div>
      )}

      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          {user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt=""
              className="h-14 w-14 rounded-full border-2 border-slate-200"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200">
              <User className="h-6 w-6 text-slate-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-bold">{user.displayName ?? "ユーザー"}</div>
            <div className="truncate text-sm text-slate-500">{user.email}</div>
          </div>
          <a
            href="/api/auth/logout"
            className="inline-flex items-center gap-1 rounded-lg border-2 border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-400"
          >
            <LogOut className="h-3 w-3" />
            ログアウト
          </a>
        </div>
      </div>

      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              現在のプラン
            </div>
            <div className="mt-1 flex items-center gap-2 text-2xl font-black">
              {pro ? (
                <>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span>Pro</span>
                </>
              ) : (
                <span>Free</span>
              )}
            </div>
          </div>
          {pro ? (
            <form action={openBillingPortalAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg border-2 border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-400"
              >
                支払いを管理
              </button>
            </form>
          ) : (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 font-bold text-white"
            >
              Proへ
            </Link>
          )}
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            本日の挑戦
          </div>
          <div className="mt-1 text-lg font-bold">
            {Number.isFinite(dailyLimit)
              ? `${usedToday} / ${dailyLimit} 問`
              : `${usedToday} 問 (無制限)`}
          </div>
          {Number.isFinite(dailyLimit) && (
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                style={{
                  width: `${Math.min(100, (usedToday / (dailyLimit as number)) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="累計回答" value={total.toString()} />
          <Stat
            label="正答率"
            value={total > 0 ? `${Math.round((correct / total) * 100)}%` : "—"}
          />
        </div>
      </div>

      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 space-y-2">
        <h2 className="text-sm font-bold">プラン比較</h2>
        <ul className="text-xs text-slate-600 space-y-1">
          <li>1日の回答数: Free {PLAN_LIMITS.free.dailyQuestionAttempts}問 / Pro 無制限</li>
          <li>模擬試験: Free ✕ / Pro ○</li>
          <li>詳細分析: Free ✕ / Pro ○</li>
          <li>ブックマーク: Free {PLAN_LIMITS.free.maxBookmarks}件 / Pro 無制限</li>
          <li>問題ノート: Free ✕ / Pro ○</li>
          <li>PDF書き出し: Free ✕ / Pro ○</li>
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}
