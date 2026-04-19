import Link from "next/link";
import { BookMarked, Sparkles } from "lucide-react";

export function AttributionNote({
  originType,
  sourceNote,
  examYear,
  examSeason,
  questionNumber,
}: {
  originType: string;
  sourceNote?: string | null;
  examYear?: number;
  examSeason?: "spring" | "autumn" | "annual";
  questionNumber?: number;
}) {
  if (originType === "ipa_actual") {
    const seasonLabel =
      examSeason === "spring" ? "春期" : examSeason === "autumn" ? "秋期" : "";
    return (
      <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-700">
          <BookMarked className="h-4 w-4" />
          <span className="font-bold uppercase tracking-wider">出典</span>
        </div>
        <div className="text-slate-700 leading-relaxed">
          <strong className="text-slate-900">独立行政法人 情報処理推進機構 (IPA)</strong>
          <br />
          ITパスポート試験
          {examYear ? `　令和${examYear}年度${seasonLabel}` : ""}
          {questionNumber ? `　問${questionNumber}` : ""}
          {sourceNote ? (
            <span className="block mt-1 text-slate-600">{sourceNote}</span>
          ) : null}
        </div>
        <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2">
          本問題は学習目的での引用です（著作権法第32条）。原典は
          <Link
            href="https://www.ipa.go.jp/shiken/mondai-kaiotu/ip_questions.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 underline mx-1"
          >
            IPA公開過去問題
          </Link>
          を参照してください。著作権はIPAに帰属します。
        </div>
      </div>
    );
  }

  // ipa_inspired / original
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 text-xs flex gap-2 items-start">
      <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-violet-600" />
      <div className="text-violet-900/80 leading-relaxed">
        <span className="font-bold text-violet-900">オリジナル問題</span>

        {sourceNote ??
          "IPA ITパスポート試験の出題範囲・頻出論点を元に作成しました。実際の過去問の文言とは異なります。"}
      </div>
    </div>
  );
}
