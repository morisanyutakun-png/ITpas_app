import Link from "next/link";
import { Sparkles } from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { hasFeature } from "@/lib/plan";

/**
 * Server component. Returns `null` for plans with the `adFree` feature
 * (Pro/Premium). For Free users it renders a self-promo slot — the same
 * slot can be swapped for a 3rd-party ad unit later without changing the
 * call sites.
 *
 * Placement: dashboard top, question list header, result screen.
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
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-700">
          <Sparkles className="h-3 w-3" />
          広告 — Proで非表示
        </div>
        <div className="mt-2 text-sm font-bold text-slate-900">
          1日無制限 × 詳細分析 × 模擬試験 = ¥780/月
        </div>
        <p className="mt-1 text-xs text-slate-600">
          広告なしで集中できる学習環境にアップグレード。
        </p>
        <Link
          href="/pricing?reason=ad_free"
          className="mt-2 inline-flex rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white"
        >
          Proを見る →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 px-4 py-2 text-xs">
      <div className="flex items-center gap-2 text-slate-700">
        <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
          広告
        </span>
        <span>
          広告非表示で集中して学習するなら <strong>Pro (¥780/月)</strong>
        </span>
      </div>
      <Link
        href="/pricing?reason=ad_free"
        className="shrink-0 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white"
      >
        解除
      </Link>
    </div>
  );
}
