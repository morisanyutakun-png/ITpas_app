import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { readCurrentUser } from "@/lib/currentUser";
import {
  getDailyAttemptCount,
  hasFeature,
  isPaid,
  isPremium,
  limitsFor,
  PLAN_LIMITS,
  planLabel,
} from "@/lib/plan";
import { openBillingPortalAction } from "@/server/actions/checkout";
import {
  CheckCircle2,
  Crown,
  FileText,
  LogOut,
  ShieldCheck,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { AdSlot } from "@/components/AdSlot";

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
          進捗を端末をまたいで保存し、Pro/Premiumを使うにはGoogleでログインしてください。
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

  const paid = isPaid(user);
  const premium = isPremium(user);
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
          {sp.upgraded === "premium" ? "Premium" : "Pro"}へのアップグレードが完了しました！
        </div>
      )}
      {sp.portal === "no_customer" && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Stripeの課金情報がまだ関連付けられていません。先にProまたはPremiumへアップグレードしてください。
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
              {premium ? (
                <>
                  <Crown className="h-5 w-5 text-violet-500" />
                  <span>Premium</span>
                </>
              ) : paid ? (
                <>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span>Pro</span>
                </>
              ) : (
                <span>Free</span>
              )}
            </div>
          </div>
          {paid ? (
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
              アップグレード
            </Link>
          )}
        </div>

        {paid && !premium && (
          <Link
            href="/pricing"
            className="flex items-center gap-3 rounded-xl border-2 border-violet-200 bg-violet-50 p-3 text-sm text-violet-900 transition hover:border-violet-400"
          >
            <Crown className="h-5 w-5 text-violet-600" />
            <div className="flex-1">
              <div className="font-bold">Premium にアップグレード</div>
              <div className="text-xs text-violet-700">全年度アーカイブ + AI個別解説 + 優先サポート</div>
            </div>
            <span className="text-xs font-bold">→</span>
          </Link>
        )}

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

      <div className="grid gap-3 md:grid-cols-3">
        <FeatureCard
          icon={Target}
          title="模擬試験"
          desc={`100問 / 120分`}
          href="/learn/mock-exam"
          locked={!hasFeature(user, "mockExam")}
          lockedHint="Proで解放"
        />
        <FeatureCard
          icon={FileText}
          title="学習レポートPDF"
          desc="ワンクリック発行"
          href="/account/report"
          locked={!hasFeature(user, "pdfExport")}
          lockedHint="Proで解放"
        />
        <FeatureCard
          icon={ShieldCheck}
          title="優先サポート"
          desc="メール24h以内"
          href="/account/support"
          locked={!hasFeature(user, "prioritySupport")}
          lockedHint="Premium限定"
          premium
        />
      </div>

      <AdSlot variant="banner" />

      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 space-y-2">
        <h2 className="text-sm font-bold">プラン比較 (現在: {planLabel(user.plan)})</h2>
        <ul className="text-xs text-slate-600 space-y-1">
          <li>1日の回答数: Free {PLAN_LIMITS.free.dailyQuestionAttempts}問 / Pro・Premium 無制限</li>
          <li>模擬試験: Free ✕ / Pro ○ / Premium ○ (最大{PLAN_LIMITS.premium.maxSessionCount}問)</li>
          <li>詳細分析: Free ✕ / Pro ○ / Premium ○</li>
          <li>ブックマーク: Free {PLAN_LIMITS.free.maxBookmarks}件 / Pro・Premium 無制限</li>
          <li>問題ノート: Free ✕ / Pro ○ / Premium ○</li>
          <li>PDF書き出し: Free ✕ / Pro ○ / Premium ○</li>
          <li>全年度フルアーカイブ: Premium のみ</li>
          <li>AI個別解説: Premium のみ</li>
          <li>優先サポート: Premium のみ</li>
        </ul>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  href,
  locked,
  lockedHint,
  premium,
}: {
  icon: typeof User;
  title: string;
  desc: string;
  href: string;
  locked: boolean;
  lockedHint: string;
  premium?: boolean;
}) {
  const hoverBorder = premium ? "hover:border-violet-400" : "hover:border-slate-400";
  const iconWrap = premium
    ? "bg-violet-100 text-violet-700"
    : "bg-slate-900 text-white";
  return (
    <Link
      href={locked ? "/pricing" : href}
      className={`flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 transition ${hoverBorder} ${
        locked ? "opacity-70" : ""
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconWrap}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate">{title}</div>
        <div className="text-[11px] text-slate-500 truncate">
          {locked ? lockedHint : desc}
        </div>
      </div>
    </Link>
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
