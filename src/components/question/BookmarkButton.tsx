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
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted px-3 text-[13px] font-medium text-muted-foreground active:opacity-80"
        title="ブックマークにはログインが必要です"
      >
        <Bookmark className="h-3.5 w-3.5" />
        保存
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
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors active:opacity-80 ${
          bookmarked
            ? "bg-ios-orange/10 text-ios-orange"
            : "bg-muted text-foreground"
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
