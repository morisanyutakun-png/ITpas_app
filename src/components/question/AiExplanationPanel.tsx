"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { generateAiExplanationAction } from "@/server/actions/aiExplanation";
import type { Plan } from "@/lib/plan";

type Section = { heading: string; body: string };

export function AiExplanationPanel({
  questionId,
  unlocked,
  plan,
}: {
  questionId: string;
  unlocked: boolean;
  plan: Plan;
}) {
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!unlocked) {
    return (
      <Link
        href="/pricing?reason=ai_explanations"
        className="flex items-center gap-3 rounded-2xl bg-card p-5 shadow-ios-sm active:opacity-80"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ios-purple/10 text-ios-purple">
          <Lock className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold">
            AI個別解説は Premium で解放
          </div>
          <div className="text-[12px] text-muted-foreground">
            誤答パターンに沿った補足をオンデマンド生成
            {plan === "pro" && "（Proからは差額で日割り精算）"}
          </div>
        </div>
      </Link>
    );
  }

  const onGenerate = () => {
    setError(null);
    startTransition(async () => {
      const res = await generateAiExplanationAction({ questionId });
      if (!res.ok) {
        setError(
          res.reason === "not_signed_in"
            ? "ログインが必要です"
            : res.reason === "premium_only"
            ? "Premium限定機能です"
            : "問題が見つかりませんでした"
        );
        return;
      }
      setSummary(res.summary);
      setSections(res.sections);
    });
  };

  return (
    <div className="rounded-2xl bg-card p-5 shadow-ios-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-ios-purple" strokeWidth={2.2} />
        <div className="text-[15px] font-medium">AI個別解説</div>
        <span className="rounded-full bg-ios-purple/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ios-purple">
          Premium
        </span>
        <button
          type="button"
          onClick={onGenerate}
          disabled={pending}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full bg-ios-purple px-3 text-[12px] font-semibold text-white active:opacity-80 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {summary ? "再生成" : "生成"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-xl bg-ios-red/10 px-3 py-2 text-[12px] text-ios-red">
          {error}
        </div>
      )}

      {summary ? (
        <div className="mt-4 space-y-3">
          <p className="text-[15px] leading-relaxed">{summary}</p>
          {sections.map((s, i) => (
            <div key={i}>
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-ios-purple">
                {s.heading}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">
          「生成」で、あなたの直近の選択を元に誤解パターンに即した追加解説を作ります。
        </p>
      )}
    </div>
  );
}
