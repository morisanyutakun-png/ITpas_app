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
        className="inline-flex h-8 items-center rounded-full bg-foreground px-3.5 text-[13px] font-semibold text-background"
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
      className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[13px] font-semibold text-foreground"
      aria-label="アカウント"
    >
      {user.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.imageUrl}
          alt=""
          className="h-8 w-8 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{(user.displayName ?? user.email ?? "U")[0]?.toUpperCase()}</span>
      )}
      <span
        className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background ${dotClass}`}
        aria-hidden="true"
      />
    </Link>
  );
}
