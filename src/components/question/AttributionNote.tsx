import Link from "next/link";
import { BookMarked, Sparkles, Pencil } from "lucide-react";

export function AttributionNote({
  originType,
  sourceNote,
  modifiedNote,
}: {
  originType: string;
  sourceNote?: string | null;
  modifiedNote?: string | null;
  // legacy props (kept for backwards compat with existing call sites)
  examYear?: number;
  examSeason?: "spring" | "autumn" | "annual";
  questionNumber?: number;
}) {
  if (originType === "ipa_actual") {
    return (
      <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4 text-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-700">
          <BookMarked className="h-4 w-4" />
          <span className="font-bold uppercase tracking-wider">出典</span>
        </div>

        {/* Citation in IPA-specified format */}
        <div className="text-slate-900 font-semibold">
          {sourceNote ?? "出典：IPA ITパスポート試験"}
        </div>

        {/* Modification disclosure (required by IPA when content was changed) */}
        {modifiedNote && (
          <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-slate-700 flex items-start gap-2">
            <Pencil className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-700" />
            <div>
              <span className="font-bold text-amber-800">改変について: </span>
              {modifiedNote}
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2">
          ITパスポート試験の問題および公式解答の著作権は IPA (情報処理推進機構) に帰属します。本サイトは
          <Link
            href="https://www.ipa.go.jp/shiken/faq.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 underline mx-1"
          >
            IPA公式FAQの利用条件
          </Link>
          に従い教育目的で引用しています。
        </div>
      </div>
    );
  }

  // ipa_inspired / original
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 text-xs flex gap-2 items-start">
      <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-violet-600" />
      <div className="text-violet-900/80 leading-relaxed">
        <span className="font-bold text-violet-900">オリジナル問題　</span>
        {sourceNote ??
          "IPA ITパスポート試験の出題範囲・頻出論点を元に作成しました。実際の過去問の文言とは異なります。"}
      </div>
    </div>
  );
}
