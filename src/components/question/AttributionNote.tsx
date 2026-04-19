import { Info } from "lucide-react";

export function AttributionNote({
  originType,
  sourceNote,
}: {
  originType: string;
  sourceNote?: string | null;
}) {
  const isOriginal = originType !== "ipa_actual";
  const fallback = isOriginal
    ? "本問題は IPA ITパスポート試験の出題範囲・頻出論点を元に作成したオリジナル問題です。実際の過去問の文言とは異なります。学習目的でご利用ください。"
    : "本問題は IPA (情報処理推進機構) の著作物を引用しています。原典は IPA 公開過去問題を参照してください。";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-600 flex gap-2 items-start">
      <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
      <p>{sourceNote ?? fallback}</p>
    </div>
  );
}
