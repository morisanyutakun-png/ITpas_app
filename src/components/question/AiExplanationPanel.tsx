"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Crown, Loader2, Sparkles, Wand2 } from "lucide-react";
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
      <div className="rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-white p-5 text-center space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="font-bold text-violet-900">AI個別解説はPremium限定です</div>
        <p className="text-xs text-slate-600">
          あなたの誤答パターン (この問題での直近の選択) に沿って、補足解説を生成します。
          {plan === "pro" && " Proからのアップグレードは差額で日割り精算されます。"}
        </p>
        <Link
          href="/pricing?reason=ai_explanations"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white"
        >
          <Crown className="h-3.5 w-3.5" />
          Premiumを見る
        </Link>
      </div>
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
    <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
          <Wand2 className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-violet-700">
            AI個別解説 — Premium
          </div>
          <div className="text-sm font-bold text-slate-900">
            あなたの誤答パターンに合わせた補足
          </div>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {summary ? "再生成" : "生成する"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {error}
        </div>
      )}

      {summary && (
        <div className="rounded-xl border bg-white p-4 space-y-3 text-sm">
          <p className="text-slate-800">{summary}</p>
          {sections.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-violet-700">
                {s.heading}
              </div>
              <p className="whitespace-pre-wrap text-slate-700">{s.body}</p>
            </div>
          ))}
        </div>
      )}

      {!summary && !error && (
        <p className="text-xs text-slate-600">
          「生成する」を押すと、この問題でのあなたの直近の選択 (未解答なら問題全体) を元に、
          誤解パターンに即した追加解説を作ります。
        </p>
      )}
    </div>
  );
}
