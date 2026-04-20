import Link from "next/link";
import { sql } from "drizzle-orm";
import {
  CheckCircle2,
  ChevronRight,
  Crown,
  FileText,
  LogOut,
  ShieldCheck,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { db } from "@/db/client";
import { readCurrentUser } from "@/lib/currentUser";
import {
  getDailyAttemptCount,
  hasFeature,
  isPaid,
  isPremium,
  limitsFor,
  planLabel,
} from "@/lib/plan";
import { openBillingPortalAction } from "@/server/actions/checkout";
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
      <div className="mx-auto max-w-md space-y-5 pt-6">
        <div className="rounded-3xl bg-card p-6 text-center shadow-ios-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="mt-3 text-ios-title3 font-semibold">アカウント</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Googleでログインすると、端末をまたいで進捗を保存できます。
          </p>
          <Link
            href="/api/auth/google/login?returnTo=/account"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-[15px] font-semibold text-background active:opacity-80"
          >
            Googleでログイン
          </Link>
        </div>
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
  const totals = (totalsRow.rows[0] ?? {}) as {
    total?: number;
    correct?: number;
  };
  const total = Number(totals.total ?? 0);
  const correct = Number(totals.correct ?? 0);
  const dailyLimit = limitsFor(user.plan).dailyQuestionAttempts;

  return (
    <div className="space-y-6">
      {sp.upgraded && (
        <div className="flex items-center gap-2 rounded-2xl bg-ios-green/10 px-4 py-3 text-[13px] text-ios-green shadow-ios-sm">
          <CheckCircle2 className="h-4 w-4" />
          {sp.upgraded === "premium" ? "Premium" : "Pro"}へのアップグレードが完了しました
        </div>
      )}
      {sp.portal === "no_customer" && (
        <div className="rounded-2xl bg-ios-yellow/10 px-4 py-3 text-[13px] text-ios-orange shadow-ios-sm">
          Stripeの課金情報が未紐付けです。先にアップグレードしてください。
        </div>
      )}

      {/* Profile header */}
      <section className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-ios-sm">
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt=""
            className="h-14 w-14 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-ios-title3 font-semibold">
            {user.displayName ?? "ユーザー"}
          </div>
          <div className="truncate text-[12px] text-muted-foreground">
            {user.email}
          </div>
        </div>
      </section>

      {/* Plan section */}
      <section className="space-y-2">
        <div className="ios-section-label">プラン</div>
        <div className="rounded-2xl bg-card p-5 shadow-ios-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {premium ? (
                <Crown className="h-5 w-5 text-ios-purple" />
              ) : paid ? (
                <Sparkles className="h-5 w-5 text-ios-orange" />
              ) : null}
              <span className="text-ios-title2 font-semibold">
                {planLabel(user.plan)}
              </span>
            </div>
            {paid ? (
              <form action={openBillingPortalAction}>
                <button
                  type="submit"
                  className="h-9 rounded-full bg-muted px-3.5 text-[13px] font-semibold text-foreground active:opacity-80"
                >
                  支払い管理
                </button>
              </form>
            ) : (
              <Link
                href="/pricing"
                className="h-9 inline-flex items-center rounded-full bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground active:opacity-80"
              >
                アップグレード
              </Link>
            )}
          </div>

          {/* Daily usage bar */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between text-[12px]">
              <span className="text-muted-foreground">本日の挑戦</span>
              <span className="font-semibold">
                {Number.isFinite(dailyLimit)
                  ? `${usedToday} / ${dailyLimit}問`
                  : `${usedToday}問（無制限）`}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${
                  Number.isFinite(dailyLimit)
                    ? "bg-primary"
                    : "bg-ios-green"
                }`}
                style={{
                  width: Number.isFinite(dailyLimit)
                    ? `${Math.min(100, (usedToday / (dailyLimit as number)) * 100)}%`
                    : "100%",
                }}
              />
            </div>
          </div>

          {/* Totals */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/60 p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                累計回答
              </div>
              <div className="mt-1 text-[22px] font-semibold tabular-nums">
                {total}
              </div>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                正答率
              </div>
              <div className="mt-1 text-[22px] font-semibold tabular-nums">
                {total > 0 ? `${Math.round((correct / total) * 100)}%` : "—"}
              </div>
            </div>
          </div>

          {paid && !premium && (
            <Link
              href="/pricing?reason=year_locked"
              className="mt-4 flex items-center gap-3 rounded-xl bg-ios-purple/10 p-3 text-[13px] text-ios-purple active:opacity-80"
            >
              <Crown className="h-4 w-4 shrink-0" />
              <span className="flex-1">
                <span className="font-semibold">Premiumへ</span>
                <span className="block text-[11px] opacity-80">
                  全年度アーカイブ + AI個別解説 + 優先サポート
                </span>
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Tools list (grouped) */}
      <section className="space-y-2">
        <div className="ios-section-label">ツール</div>
        <div className="ios-list shadow-ios-sm">
          <SettingsRow
            icon={Target}
            tint="text-ios-blue"
            title="模擬試験"
            sub={
              hasFeature(user, "mockExam") ? "100問 / 120分" : "Proで解放"
            }
            href={
              hasFeature(user, "mockExam")
                ? "/learn/mock-exam"
                : "/pricing?reason=mock_exam"
            }
          />
          <SettingsRow
            icon={FileText}
            tint="text-ios-green"
            title="学習レポート (PDF)"
            sub={
              hasFeature(user, "pdfExport") ? "ワンクリック発行" : "Proで解放"
            }
            href={
              hasFeature(user, "pdfExport")
                ? "/account/report"
                : "/pricing?reason=pdf_export"
            }
          />
          <SettingsRow
            icon={ShieldCheck}
            tint="text-ios-purple"
            title="優先サポート"
            sub={
              hasFeature(user, "prioritySupport")
                ? "メール24時間以内返信"
                : "Premiumで解放"
            }
            href={
              hasFeature(user, "prioritySupport")
                ? "/account/support"
                : "/pricing?reason=priority_support"
            }
          />
        </div>
      </section>

      <AdSlot variant="banner" />

      {/* Links */}
      <section className="space-y-2">
        <div className="ios-section-label">その他</div>
        <div className="ios-list shadow-ios-sm">
          <SettingsLink href="/bookmarks" label="ブックマーク" />
          <SettingsLink href="/history" label="学習履歴" />
          <SettingsLink href="/pricing" label="料金プラン" />
          <SettingsLink href="/legal" label="著作権・引用について" />
        </div>
      </section>

      {/* Logout */}
      <a
        href="/api/auth/logout"
        className="flex items-center justify-center gap-1.5 rounded-2xl bg-card p-4 text-[15px] font-semibold text-ios-red shadow-ios-sm active:opacity-80"
      >
        <LogOut className="h-4 w-4" />
        ログアウト
      </a>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  tint,
  title,
  sub,
  href,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tint: string;
  title: string;
  sub: string;
  href: string;
}) {
  return (
    <Link href={href} className="ios-row active:bg-muted/60">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
        <Icon className={`h-4 w-4 ${tint}`} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium">{title}</div>
        <div className="text-[12px] text-muted-foreground">{sub}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function SettingsLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="ios-row active:bg-muted/60">
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
