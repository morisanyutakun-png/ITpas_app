import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import {
  getDailyAttemptCount,
  isPaid,
  isPremium,
  limitsFor,
} from "@/lib/plan";

export async function UserMenu() {
  const user = await readCurrentUser();

  if (!user || !user.isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/pricing"
          className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow"
        >
          <Sparkles className="h-3 w-3" />
          Pro
        </Link>
        <Link
          href="/api/auth/google/login?returnTo=/"
          className="rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-400"
        >
          ログイン
        </Link>
      </div>
    );
  }

  const paid = isPaid(user);
  const premium = isPremium(user);
  const limit = limitsFor(user.plan).dailyQuestionAttempts;
  const used = await getDailyAttemptCount(user.id);
  const remaining = Number.isFinite(limit) ? Math.max(0, (limit as number) - used) : null;

  return (
    <div className="flex items-center gap-2">
      {!paid && remaining !== null && (
        <Link
          href="/pricing"
          className="hidden md:inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100"
          title={`今日の残り無料枠: ${remaining}/${limit}問`}
        >
          残 {remaining}/{limit}
        </Link>
      )}
      {premium ? (
        <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
          <Crown className="h-3 w-3" />
          Premium
        </span>
      ) : paid ? (
        <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
          <Sparkles className="h-3 w-3" />
          Pro
        </span>
      ) : null}
      <Link href="/account" className="flex items-center gap-2" aria-label="アカウント">
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt=""
            className="h-8 w-8 rounded-full border-2 border-slate-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
            {user.email?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
      </Link>
    </div>
  );
}
