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
        <div className="surface-card relative overflow-hidden p-7 text-center">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-grad-ink text-white shadow-tile">
            <User className="h-7 w-7" strokeWidth={2} />
          </div>
          <h1 className="mt-4 text-ios-title2 font-semibold">アカウント</h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
            Googleでログインすると、端末をまたいで進捗を保存できます。
          </p>
          <Link
            href="/api/auth/google/login?returnTo=/account"
            className="pill-neutral mt-5 h-12 w-full text-[15px]"
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
        <div className="flex items-center gap-2 rounded-2xl bg-ios-green/10 px-4 py-3 text-[13px] text-ios-green ring-1 ring-ios-green/15">
          <CheckCircle2 className="h-4 w-4" />
          {sp.upgraded === "premium" ? "Premium" : "Pro"}へのアップグレードが完了しました
        </div>
      )}
      {sp.portal === "no_customer" && (
        <div className="rounded-2xl bg-ios-yellow/10 px-4 py-3 text-[13px] text-ios-orange ring-1 ring-ios-orange/15">
          Stripeの課金情報が未紐付けです。先にアップグレードしてください。
        </div>
      )}

      {/* Profile header — gradient hero (plan-aware) */}
      <section
        className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-hero ${
          premium ? "bg-grad-purple" : paid ? "bg-grad-orange" : "bg-grad-ink"
        }`}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-4">
          {user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt=""
              className="h-16 w-16 rounded-full ring-2 ring-white/40 shadow-ios-lg"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/40 backdrop-blur">
              <User className="h-7 w-7" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
              {planLabel(user.plan)}
            </div>
            <div className="mt-0.5 truncate text-[22px] font-semibold leading-tight tracking-tight">
              {user.displayName ?? "ユーザー"}
            </div>
            <div className="truncate text-[12.5px] opacity-85">
              {user.email}
            </div>
          </div>
        </div>
      </section>

      {/* Plan section */}
      <section className="space-y-2">
        <div className="ios-section-label">プラン</div>
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {premium ? (
                <Crown className="h-5 w-5 text-ios-purple" />
              ) : paid ? (
                <Sparkles className="h-5 w-5 text-ios-orange" />
              ) : null}
              <span className="text-[20px] font-semibold tracking-tight">
                {planLabel(user.plan)}
              </span>
            </div>
            {paid ? (
              <form action={openBillingPortalAction}>
                <button
                  type="submit"
                  className="pill-ghost h-9 px-3.5 text-[13px]"
                >
                  支払い管理
                </button>
              </form>
            ) : (
              <Link
                href="/pricing"
                className="pill-primary h-9 px-3.5 text-[13px]"
              >
                アップグレード
              </Link>
            )}
          </div>

          {/* Daily usage bar */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between text-[12px]">
              <span className="text-muted-foreground">本日の挑戦</span>
              <span className="num font-semibold">
                {Number.isFinite(dailyLimit)
                  ? `${usedToday} / ${dailyLimit}問`
                  : `${usedToday}問（無制限）`}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                  Number.isFinite(dailyLimit)
                    ? "bg-gradient-to-r from-[#5E5CE6] to-[#0A84FF]"
                    : "bg-gradient-to-r from-[#30D158] to-[#00C7BE]"
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
            <div className="surface-recessed p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                累計回答
              </div>
              <div className="num mt-1 text-[24px] font-semibold tracking-tight">
                {total}
              </div>
            </div>
            <div className="surface-recessed p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                正答率
              </div>
              <div className="num mt-1 text-[24px] font-semibold tracking-tight">
                {total > 0 ? `${Math.round((correct / total) * 100)}%` : "—"}
              </div>
            </div>
          </div>

          {paid && !premium && (
            <Link
              href="/pricing?reason=year_locked"
              className="mt-4 flex items-center gap-3 rounded-xl bg-ios-purple/10 p-3.5 text-[13px] text-ios-purple ring-1 ring-ios-purple/15 transition-transform active:scale-[0.99]"
            >
              <Crown className="h-4 w-4 shrink-0" />
              <span className="flex-1">
                <span className="font-semibold">Premiumへ</span>
                <span className="block text-[11.5px] opacity-80">
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
        <div className="ios-list">
          <SettingsRow
            icon={Target}
            tile="bg-grad-ocean"
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
            tile="bg-grad-green"
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
            tile="bg-grad-purple"
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
        <div className="ios-list">
          <SettingsLink href="/bookmarks" label="ブックマーク" />
          <SettingsLink href="/history" label="学習履歴" />
          <SettingsLink href="/pricing" label="料金プラン" />
          <SettingsLink href="/legal" label="著作権・引用について" />
        </div>
      </section>

      {/* Logout */}
      <a
        href="/api/auth/logout"
        className="surface-card flex items-center justify-center gap-1.5 p-4 text-[15px] font-semibold text-ios-red transition-transform active:scale-[0.99]"
      >
        <LogOut className="h-4 w-4" />
        ログアウト
      </a>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  tile,
  title,
  sub,
  href,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tile: string;
  title: string;
  sub: string;
  href: string;
}) {
  return (
    <Link href={href} className="ios-row active:bg-muted/60">
      <span className={`tile-icon-sm ${tile}`}>
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[12.5px] text-muted-foreground">{sub}</div>
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
