import Link from "next/link";
import { Bookmark, ChevronRight, Crown, Layers } from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import { getBookmarksForUser } from "@/server/queries/personal";
import { hasFeature, limitsFor } from "@/lib/plan";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";
export const metadata = { title: "保存" };

const MAJOR_HUE: Record<string, { hue: string; hueDim: string; label: string }> = {
  strategy: {
    hue: "#FF375F",
    hueDim: "rgba(255,55,95,0.12)",
    label: "STRATEGY",
  },
  management: {
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.12)",
    label: "MANAGEMENT",
  },
  technology: {
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.12)",
    label: "TECHNOLOGY",
  },
};

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  const rows = await getBookmarksForUser(user.id);
  const limit = limitsFor(user.plan).maxBookmarks;
  const cap = Number.isFinite(limit) ? (limit as number) : null;
  const atCap = cap !== null && rows.length >= cap;
  const showAds = !hasFeature(user, "adFree");

  // Group by major category for editorial layout
  const byMajor = rows.reduce<Record<string, typeof rows>>((acc, r) => {
    (acc[r.majorCategory] ||= []).push(r);
    return acc;
  }, {});
  const orderedMajors: Array<"strategy" | "management" | "technology"> = [
    "strategy",
    "management",
    "technology",
  ];

  const pct = cap !== null ? Math.min(100, (rows.length / cap) * 100) : 0;

  return (
    <div className="space-y-7 pb-10">
      {/* ── Editorial header ── */}
      <header className="flex items-end justify-between gap-3 pt-1">
        <div className="space-y-1.5">
          <div className="kicker">Saved</div>
          <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
            保存した問題
          </h1>
          <p className="text-[13.5px] text-muted-foreground">
            後で見返したい論点をここに。
          </p>
        </div>
        {!user.isSignedIn && (
          <Link
            href="/api/auth/google/login?returnTo=/bookmarks"
            className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-[13.5px] font-semibold text-background shadow-ios active:opacity-90"
          >
            ログイン
          </Link>
        )}
      </header>

      {/* ── Counter hero — quota ring + category breakdown ── */}
      {rows.length > 0 && (
        <section className="editorial-card p-5">
          <div className="relative z-10 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-grad-orange text-white shadow-tile">
                <Bookmark className="h-6 w-6" strokeWidth={2.2} />
              </span>
              <div>
                <div className="kicker">Saved</div>
                <div className="num mt-1 text-[30px] font-semibold leading-none tracking-tight">
                  {rows.length}
                  {cap !== null && (
                    <span className="ml-1 text-[14px] font-medium text-muted-foreground">
                      / {cap}
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] text-muted-foreground">
                  {cap === null ? "Pro / Premium 無制限" : "件"}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {cap !== null && (
                <div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full"
                    style={{ background: "rgba(255,149,0,0.14)" }}
                  >
                    <div
                      className="h-full rounded-full bg-grad-orange transition-[width] duration-500"
                      style={{ width: `${Math.max(3, pct)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10.5px] text-muted-foreground">
                    Free プランは {cap} 件まで
                  </div>
                </div>
              )}
              {/* Category breakdown chips */}
              <div className="flex flex-wrap gap-1.5">
                {orderedMajors.map((m) => {
                  const meta = MAJOR_HUE[m];
                  const count = byMajor[m]?.length ?? 0;
                  if (count === 0) return null;
                  return (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.12em]"
                      style={{
                        background: meta.hueDim,
                        color: meta.hue,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: meta.hue }}
                      />
                      {meta.label}
                      <span className="num ml-0.5">{count}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {atCap && (
        <Link
          href="/pricing?reason=bookmarks"
          className="surface-card group flex items-center gap-3 p-4 transition-transform active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-grad-purple text-white shadow-tile">
            <Crown className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
              Upgrade · Bookmarks
            </div>
            <div className="text-[14.5px] font-semibold">
              上限 {cap}件に到達。Pro なら無制限。
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {showAds && <AdSlot variant="banner" />}

      {/* ── Empty / Grouped list ── */}
      {rows.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Bookmark className="h-5 w-5" />
          </span>
          <div className="text-[15px] font-medium">
            まだブックマークがありません
          </div>
          <p className="text-[12.5px] text-muted-foreground">
            問題詳細で ♡ を押すとここに溜まります。
          </p>
          <Link
            href="/learn/session/new?mode=weakness&count=5"
            className="inline-flex h-10 items-center gap-1 rounded-full bg-foreground px-4 text-[13.5px] font-semibold text-background active:opacity-90"
          >
            5問セッションを始める
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <section className="space-y-5">
          {orderedMajors.map((m) => {
            const list = byMajor[m];
            if (!list || list.length === 0) return null;
            const meta = MAJOR_HUE[m];
            return (
              <div key={m} className="space-y-2">
                <div className="flex items-baseline justify-between px-1">
                  <div
                    className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: meta.hue }}
                  >
                    {meta.label}
                  </div>
                  <div className="num text-[10.5px] text-muted-foreground">
                    {list.length}件
                  </div>
                </div>
                <div className="surface-card divide-y divide-border overflow-hidden">
                  {list.map((r) => (
                    <Link
                      key={r.questionId}
                      href={`/learn/questions/${r.questionId}`}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: meta.hueDim, color: meta.hue }}
                      >
                        <Layers className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="num text-[10.5px] font-medium text-muted-foreground">
                          R{r.examYear} · 問{r.questionNumber}
                        </div>
                        <div className="line-clamp-2 text-[13.5px]">
                          {r.stem}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
