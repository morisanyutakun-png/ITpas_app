"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Sparkles,
  Target,
  X,
} from "lucide-react";

/**
 * ログイン前の「1問体験」UI。
 *
 * LP 内に埋め込み、Google サインイン前にサービスの価値（誤答に魅力理由が
 * 付く体験）を 30 秒で味わってもらう導線。サンプル問題は静的にハードコード
 * （DB / Server Action 不要）。
 */

type Choice = {
  label: "ア" | "イ" | "ウ" | "エ";
  body: string;
  isCorrect: boolean;
  whyAttractive?: string;
  counterExample?: string;
  archetypeLabel?: string;
};

const SAMPLE = {
  meta: { year: "R6", season: "秋", number: 12, category: "テクノロジ系" },
  stem: "マルウェアの一種である「ワーム」の特徴として、最も適切なものはどれか。",
  choices: [
    {
      label: "ア",
      body: "ネットワークなどを介して、自身の複製を作りながら拡散していく。",
      isCorrect: true,
    },
    {
      label: "イ",
      body: "正常なファイルに寄生して、そのファイルが実行されたときに動作する。",
      isCorrect: false,
      whyAttractive:
        "「マルウェア＝寄生して悪さをする」というウイルスのイメージが先に浮かびがち。でも"
        + "『寄生する』のはウイルス。ワームは単体で動きます。",
      counterExample:
        "ウイルス＝他のファイルに寄生 / ワーム＝単独で自己複製・拡散 / トロイ＝偽装、自己複製しない。",
      archetypeLabel: "言い換え罠",
    },
    {
      label: "ウ",
      body: "ハードウェアの故障を引き起こすため、物理的な対策が必要となる。",
      isCorrect: false,
      whyAttractive:
        "「マルウェア被害＝深刻」のイメージから物理破壊と結びつけがち。実際にはワームの主な被害はネットワーク負荷とデータ侵害。",
      counterExample:
        "ワームは物理的にハードを壊すものではなく、ネットワーク経由でソフト的に拡散します。",
      archetypeLabel: "範囲取り違え",
    },
    {
      label: "エ",
      body: "正規のソフトウェアに偽装し、ユーザに気付かれずインストールされる。",
      isCorrect: false,
      whyAttractive:
        "「気付かれず侵入」と聞くとワームを思い浮かべがち。これは"
        + "トロイの木馬の特徴。ワームは「気付かせない」より「自分で広がる」が本質。",
      counterExample:
        "偽装してインストールされる＝トロイ。ワームの本質は『自己複製・自己拡散』。",
      archetypeLabel: "対比錯誤",
    },
  ] as Choice[],
};

export function TryOneQuestion() {
  const [selected, setSelected] = useState<Choice["label"] | null>(null);
  const [revealed, setRevealed] = useState(false);

  const selectedChoice = SAMPLE.choices.find((c) => c.label === selected) ?? null;
  const correctChoice = SAMPLE.choices.find((c) => c.isCorrect)!;
  const isCorrect = selectedChoice?.isCorrect ?? false;

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Card frame — looks like an app screen */}
      <div className="surface-card relative overflow-hidden p-5 sm:p-7">
        {/* Decorative ambient blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-ios-blue/15 blur-3xl"
        />

        {/* Header */}
        <div className="relative flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
          <span className="rounded-full bg-foreground px-2 py-0.5 text-background">
            体験版
          </span>
          <span className="rounded-full bg-grad-green px-2 py-0.5 text-white">
            {SAMPLE.meta.category}
          </span>
          <span className="num ml-auto text-muted-foreground">
            {SAMPLE.meta.year}{SAMPLE.meta.season} 問{SAMPLE.meta.number}
          </span>
        </div>

        {/* Stem */}
        <p className="relative mt-4 text-[15.5px] leading-[1.8] text-foreground/95">
          {SAMPLE.stem}
        </p>

        {/* Choices */}
        <div className="relative mt-5 space-y-2.5">
          {SAMPLE.choices.map((c, i) => {
            const isSelected = selected === c.label;
            const showCorrect = revealed && c.isCorrect;
            const showWrong = revealed && isSelected && !c.isCorrect;
            const dimmed = revealed && !c.isCorrect && !isSelected;

            return (
              <motion.button
                key={c.label}
                type="button"
                disabled={revealed}
                onClick={() => setSelected(c.label)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: dimmed ? 0.45 : 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                whileTap={!revealed ? { scale: 0.985 } : undefined}
                className={[
                  "group relative flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 text-left ring-1 transition-[background-color,box-shadow] sm:p-4",
                  "ring-black/[0.06] dark:ring-white/[0.08]",
                  !revealed && !isSelected && "hover:bg-muted/50",
                  !revealed && isSelected &&
                    "!ring-2 !ring-primary bg-primary/[0.05] shadow-tint-blue",
                  showCorrect && "!ring-2 !ring-ios-green bg-ios-green/[0.06]",
                  showWrong && "!ring-2 !ring-ios-red bg-ios-red/[0.06]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold transition-colors",
                    !revealed && !isSelected && "bg-muted text-foreground",
                    !revealed && isSelected && "bg-primary text-primary-foreground",
                    showCorrect && "bg-ios-green text-white",
                    showWrong && "bg-ios-red text-white",
                    dimmed && "bg-muted text-muted-foreground",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {c.label}
                </span>
                <span className="flex-1 text-[14px] leading-relaxed text-foreground">
                  {c.body}
                </span>
                {showCorrect && (
                  <motion.span
                    initial={{ scale: 0, rotate: -16 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ios-green text-white"
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </motion.span>
                )}
                {showWrong && (
                  <motion.span
                    initial={{ scale: 0, rotate: 16 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ios-red text-white"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Submit button */}
        <AnimatePresence>
          {!revealed && (
            <motion.button
              key="submit"
              type="button"
              disabled={!selected}
              onClick={() => setRevealed(true)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="relative mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground shadow-tint-blue transition active:opacity-80 disabled:opacity-40 disabled:shadow-none"
            >
              {selected ? "答え合わせ" : "選択肢を選んでください"}
              {selected && <ArrowRight className="h-4 w-4" />}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Reveal */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="relative mt-5 space-y-3"
            >
              {/* Verdict */}
              <div
                className={[
                  "flex items-center gap-3 rounded-2xl p-3.5",
                  isCorrect
                    ? "bg-ios-green/10 ring-1 ring-ios-green/30"
                    : "bg-ios-red/10 ring-1 ring-ios-red/30",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-white",
                    isCorrect ? "bg-ios-green" : "bg-ios-red",
                  ].join(" ")}
                >
                  {isCorrect ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <X className="h-4 w-4" strokeWidth={3} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold tracking-tight">
                    {isCorrect ? "正解です！" : "おしい！正解は " + correctChoice.label}
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    {isCorrect
                      ? "他の3つが、なぜ魅力的に見えるかを下で確認しましょう"
                      : "なぜそちらに引き寄せられたか、ここで言語化します"}
                  </div>
                </div>
              </div>

              {/* WhyAttractive — the signature moment */}
              {!isCorrect && selectedChoice?.whyAttractive && (
                <WhyAttractiveBlock choice={selectedChoice} />
              )}

              {/* When correct: show one of the wrong choices' "why" as a teaser */}
              {isCorrect && (
                <WhyAttractiveBlock
                  choice={SAMPLE.choices.find((c) => !c.isCorrect && c.whyAttractive)!}
                  caption="他の選択肢の『なぜ魅力的か』を1つ見てみましょう"
                />
              )}

              {/* CTA — sign in to keep going */}
              <div className="rounded-2xl bg-gradient-to-br from-ios-blue/8 via-card to-card p-4 ring-1 ring-ios-blue/20">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ios-blue text-white">
                    <Sparkles className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold tracking-tight">
                      続きは、無料で。
                    </div>
                    <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                      解説の全文・関連論点・あなたの誤答パターン分析が見られます。クレカ不要。
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href="/api/auth/google/login?returnTo=/home"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13.5px] font-semibold text-background shadow-ios active:scale-[0.98]"
                  >
                    無料で続きを始める
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setRevealed(false);
                    }}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-muted px-4 text-[13px] font-semibold text-foreground hover:bg-muted/70 active:scale-[0.98]"
                  >
                    もう一度試す
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footnote */}
      <p className="mt-3 px-1 text-center text-[11.5px] text-muted-foreground">
        ※ サンプル問題はIPA過去問を参考に作成。本サービスでは令和元年〜直近の本試験740問が利用できます。
      </p>
    </div>
  );
}

function WhyAttractiveBlock({
  choice,
  caption,
}: {
  choice: Choice;
  caption?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl p-4 shadow-ios ring-1 ring-ios-orange/20"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#FFF2E0] via-[#FFE4C4] to-[#FFD9B3] dark:from-[#3b2a15] dark:via-[#2d1f10] dark:to-[#25180b]" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ios-orange/20 blur-2xl" />

      {caption && (
        <div className="relative mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {caption}
        </div>
      )}

      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-grad-sunset text-[15px] font-semibold text-white shadow-tint-orange">
          {choice.label}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
            <Sparkles className="h-3 w-3" strokeWidth={2.4} />
            なぜ、この選択肢に引き寄せられたか
          </div>
          {choice.archetypeLabel && (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-ios-orange/15 px-2 py-0.5 text-[10.5px] font-semibold text-ios-orange">
              <Target className="h-2.5 w-2.5" strokeWidth={2.6} />
              {choice.archetypeLabel}型の罠
            </div>
          )}
          <p className="mt-2 text-[13.5px] leading-[1.75] text-foreground/95">
            {choice.whyAttractive}
          </p>
          {choice.counterExample && (
            <div className="mt-3 rounded-xl bg-card/70 p-3 text-[12.5px] leading-relaxed text-foreground/85 ring-1 ring-black/[0.04] backdrop-blur-sm dark:bg-background/40 dark:ring-white/[0.06]">
              <span className="font-semibold">本来の違い：</span>
              {choice.counterExample}
            </div>
          )}
        </div>
        <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
      </div>
    </motion.div>
  );
}
