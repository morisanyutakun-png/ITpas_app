import Link from "next/link";
import { readCurrentUser } from "@/lib/currentUser";
import { isPaid, isPremium } from "@/lib/plan";

/**
 * Compact header chip. Apple-style: a single avatar (or login pill) — the
 * plan state is shown as a tiny colored dot overlay so it doesn't eat the
 * top bar. Full plan details live on /account.
 */
export async function UserMenu() {
  const user = await readCurrentUser();

  if (!user || !user.isSignedIn) {
    return (
      <Link
        href="/api/auth/google/login?returnTo=/"
        className="inline-flex h-8 items-center rounded-full bg-foreground px-3.5 text-[13px] font-semibold text-background transition-[transform,opacity] active:scale-[0.97]"
      >
        ログイン
      </Link>
    );
  }

  const paid = isPaid(user);
  const premium = isPremium(user);
  const dotClass = premium
    ? "bg-ios-purple"
    : paid
    ? "bg-ios-orange"
    : "hidden";

  return (
    <Link
      href="/account"
      className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted text-[13px] font-semibold text-foreground ring-1 ring-black/[0.06] transition-transform active:scale-[0.96] dark:ring-white/[0.08]"
      aria-label="アカウント"
    >
      {user.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.imageUrl}
          alt=""
          className="h-full w-full rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{(user.displayName ?? user.email ?? "U")[0]?.toUpperCase()}</span>
      )}
      <span
        className={`pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background ${dotClass}`}
        aria-hidden="true"
      />
    </Link>
  );
}
