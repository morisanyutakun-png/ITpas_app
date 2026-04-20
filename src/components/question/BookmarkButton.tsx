"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toggleBookmarkAction } from "@/server/actions/bookmarks";
import { UpgradeModal } from "@/components/UpgradeModal";

export function BookmarkButton({
  questionId,
  initialBookmarked,
  signedIn,
}: {
  questionId: string;
  initialBookmarked: boolean;
  signedIn: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [paywall, setPaywall] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <a
        href={`/api/auth/google/login?returnTo=${encodeURIComponent(
          `/learn/questions/${questionId}`
        )}`}
        className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400"
        title="ブックマークにはログインが必要です"
      >
        <Bookmark className="h-3.5 w-3.5" />
        保存 (要ログイン)
      </a>
    );
  }

  const onClick = () => {
    startTransition(async () => {
      const res = await toggleBookmarkAction({ questionId });
      if (!res.ok && res.reason === "bookmark_limit") {
        setPaywall(true);
        return;
      }
      if (res.ok) setBookmarked(res.bookmarked);
    });
  };

  return (
    <>
      <UpgradeModal
        open={paywall}
        onClose={() => setPaywall(false)}
        reason="bookmarks"
      />
      <button
        onClick={onClick}
        disabled={pending}
        className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition ${
          bookmarked
            ? "border-amber-400 bg-amber-50 text-amber-800"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
        }`}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : bookmarked ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
        {bookmarked ? "保存済み" : "保存"}
      </button>
    </>
  );
}
