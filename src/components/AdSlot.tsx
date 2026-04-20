import Link from "next/link";
import { readCurrentUser } from "@/lib/currentUser";
import { hasFeature } from "@/lib/plan";

/**
 * Self-promo slot shown to ad-supported (Free) users only. Pro/Premium
 * have `adFree` and see nothing.
 *
 * Kept calm in the Apple-style redesign — a single neutral card with a
 * small "広告" chip, rather than a colored banner.
 */
export async function AdSlot({
  variant = "banner",
}: {
  variant?: "banner" | "card";
}) {
  const user = await readCurrentUser();
  if (hasFeature(user, "adFree")) return null;

  if (variant === "card") {
    return (
      <Link
        href="/pricing?reason=ad_free"
        className="block rounded-2xl bg-card p-5 shadow-ios-sm active:opacity-80"
      >
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            広告
          </span>
          <span className="text-[11px] text-muted-foreground">
            Proで非表示
          </span>
        </div>
        <div className="mt-2 text-[15px] font-semibold">
          1日無制限 × 詳細分析 × 模擬試験
        </div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">
          広告なしで集中できる学習環境に (¥780/月〜)
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/pricing?reason=ad_free"
      className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-ios-sm active:opacity-80"
    >
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        広告
      </span>
      <span className="flex-1 text-[13px] text-foreground">
        Pro (¥780/月) で広告非表示
      </span>
      <span className="rounded-full bg-foreground px-3 py-1 text-[12px] font-semibold text-background">
        解除
      </span>
    </Link>
  );
}
