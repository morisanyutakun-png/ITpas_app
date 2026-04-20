import Link from "next/link";
import { BookMarked, Pencil, Sparkles } from "lucide-react";

export function AttributionNote({
  originType,
  sourceNote,
  modifiedNote,
}: {
  originType: string;
  sourceNote?: string | null;
  modifiedNote?: string | null;
  examYear?: number;
  examSeason?: "spring" | "autumn" | "annual";
  questionNumber?: number;
}) {
  if (originType === "ipa_actual") {
    return (
      <div className="rounded-2xl bg-card p-4 text-[12px] shadow-ios-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <BookMarked className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium uppercase tracking-[0.08em]">
            出典
          </span>
        </div>
        <div className="mt-1.5 text-[13px] font-medium">
          {sourceNote ?? "出典：IPA ITパスポート試験"}
        </div>
        {modifiedNote && (
          <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-ios-yellow/10 px-3 py-2 text-[12px]">
            <Pencil className="mt-0.5 h-3 w-3 shrink-0 text-ios-orange" />
            <div>
              <span className="font-semibold text-ios-orange">改変: </span>
              {modifiedNote}
            </div>
          </div>
        )}
        <div className="mt-2 border-t border-border/60 pt-2 text-[11px] leading-relaxed text-muted-foreground">
          問題および公式解答の著作権は IPA に帰属します。本サイトは
          <Link
            href="https://www.ipa.go.jp/shiken/faq.html"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 underline"
          >
            IPA公式FAQの利用条件
          </Link>
          に従い教育目的で引用しています。
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-2xl bg-ios-purple/5 p-4 text-[12px] shadow-ios-sm">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ios-purple" />
      <div className="leading-relaxed">
        <span className="font-semibold text-ios-purple">オリジナル問題　</span>
        <span className="text-muted-foreground">
          {sourceNote ??
            "IPA ITパスポート試験の出題範囲・頻出論点を元に作成。実際の過去問の文言とは異なります。"}
        </span>
      </div>
    </div>
  );
}
