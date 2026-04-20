import Link from "next/link";
import { Bookmark } from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import { getBookmarksForUser } from "@/server/queries/personal";
import { limitsFor } from "@/lib/plan";
import { pickFormat, pickMajor } from "@/lib/design";

export const dynamic = "force-dynamic";
export const metadata = { title: "ブックマーク" };

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  const rows = await getBookmarksForUser(user.id);
  const limit = limitsFor(user.plan).maxBookmarks;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            ブックマーク
          </h1>
          <p className="text-sm text-slate-600">
            気になった問題を後で見返せます
            {Number.isFinite(limit)
              ? ` (現在 ${rows.length}/${limit}件)`
              : ` (${rows.length}件)`}
          </p>
        </div>
        {!user.isSignedIn && (
          <Link
            href="/api/auth/google/login?returnTo=/bookmarks"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white"
          >
            ログイン
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
          <Bookmark className="mx-auto h-8 w-8 text-slate-400" />
          <div className="mt-2">まだブックマークがありません</div>
          <Link
            href="/learn/questions"
            className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white"
          >
            問題を解きに行く
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const major = pickMajor(r.majorCategory);
            const fmt = pickFormat(r.formatType);
            const FmtIcon = fmt.icon;
            return (
              <Link
                key={r.questionId}
                href={`/learn/questions/${r.questionId}`}
                className="group flex gap-3 rounded-xl border-2 border-slate-100 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className={`inline-flex items-center rounded border px-1.5 py-0 text-[10px] font-semibold ${major.chip}`}>
                      {major.label}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-700">
                      <FmtIcon className={`h-3 w-3 ${fmt.color}`} />
                      {fmt.label}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      R{r.examYear} #{r.questionNumber}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 line-clamp-2">{r.stem}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
