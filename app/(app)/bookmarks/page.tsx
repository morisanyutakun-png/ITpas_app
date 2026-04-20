import Link from "next/link";
import { Bookmark, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import { getBookmarksForUser } from "@/server/queries/personal";
import { hasFeature, limitsFor } from "@/lib/plan";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";
export const metadata = { title: "ブックマーク" };

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  const rows = await getBookmarksForUser(user.id);
  const limit = limitsFor(user.plan).maxBookmarks;
  const atCap = Number.isFinite(limit) && rows.length >= (limit as number);
  const showAds = !hasFeature(user, "adFree");

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3 pt-2">
        <div>
          <h1 className="text-ios-title1 font-semibold">保存</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {Number.isFinite(limit)
              ? `${rows.length} / ${limit}件`
              : `${rows.length}件`}
          </p>
        </div>
        {!user.isSignedIn && (
          <Link
            href="/api/auth/google/login?returnTo=/bookmarks"
            className="inline-flex h-9 items-center rounded-full bg-foreground px-3.5 text-[13px] font-semibold text-background"
          >
            ログイン
          </Link>
        )}
      </header>

      {atCap && (
        <Link
          href="/pricing?reason=bookmarks"
          className="flex items-center gap-3 rounded-2xl bg-ios-yellow/10 p-4 shadow-ios-sm active:opacity-80"
        >
          <div className="flex-1 text-[13px] text-ios-orange">
            上限 <strong>{limit as number}件</strong> に達しています。Proなら無制限。
          </div>
          <ChevronRight className="h-4 w-4 text-ios-orange" />
        </Link>
      )}

      {showAds && <AdSlot variant="banner" />}

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 text-center shadow-ios-sm">
          <Bookmark className="mx-auto h-8 w-8 text-muted-foreground" />
          <div className="mt-2 text-[15px] font-medium">
            まだブックマークがありません
          </div>
          <Link
            href="/learn/questions"
            className="mt-3 inline-flex h-10 items-center rounded-full bg-primary px-4 text-[14px] font-semibold text-primary-foreground active:opacity-80"
          >
            問題を解きに行く
          </Link>
        </div>
      ) : (
        <div className="ios-list shadow-ios-sm">
          {rows.map((r) => (
            <Link
              key={r.questionId}
              href={`/learn/questions/${r.questionId}`}
              className="ios-row items-start active:bg-muted/60"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ios-orange/10 text-ios-orange">
                <Bookmark className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span>R{r.examYear} #{r.questionNumber}</span>
                </div>
                <p className="line-clamp-2 text-[14px]">{r.stem}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
