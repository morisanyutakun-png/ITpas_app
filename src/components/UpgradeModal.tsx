"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";

export type UpgradeReason =
  | "daily_limit"
  | "mock_exam"
  | "mock_exam_size"
  | "advanced_analytics"
  | "bookmarks"
  | "notes"
  | "pdf_export"
  | "year_locked"
  | "ai_explanations"
  | "priority_support"
  | "ad_free"
  | "generic";

type Copy = {
  title: string;
  body: string;
  perks: string[];
  cta: { href: string; label: string };
  tier: "pro" | "premium";
};

const REASON_COPY: Record<UpgradeReason, Copy> = {
  daily_limit: {
    title: "今日の無料回答数に達しました",
    body: "Proにアップグレードすると1日無制限になります。",
    perks: [
      "問題演習 1日無制限",
      "詳細ヒートマップ / 日次推移",
      "模擬試験 (100問 / 120分)",
      "広告非表示",
    ],
    cta: { href: "/pricing?reason=daily_limit", label: "Proを見る (¥780/月〜)" },
    tier: "pro",
  },
  mock_exam: {
    title: "模擬試験は Pro で解放されます",
    body: "100問・120分の本番形式で時間配分と体力を鍛えます。",
    perks: ["100問 / 120分", "自動採点 / 結果レポート", "時間配分のリハーサル"],
    cta: { href: "/pricing?reason=mock_exam", label: "Proを見る" },
    tier: "pro",
  },
  mock_exam_size: {
    title: "150問・200問は Premium で解放",
    body: "Proは100問まで、Premiumは最大200問まで拡張できます。",
    perks: ["最大200問まで拡張", "全年度アーカイブ", "AI個別解説"],
    cta: { href: "/pricing?reason=mock_exam_size", label: "Premiumを見る" },
    tier: "premium",
  },
  advanced_analytics: {
    title: "詳細分析は Pro で解放",
    body: "誤解パターンのヒートマップ、論点別の強弱、学習経路の推薦。",
    perks: ["誤解パターン別ヒートマップ", "論点別の強弱", "学習経路の推薦"],
    cta: { href: "/pricing?reason=advanced_analytics", label: "Proを見る" },
    tier: "pro",
  },
  bookmarks: {
    title: "ブックマーク上限に達しました",
    body: "無料は3件まで。Proなら無制限に保存できます。",
    perks: ["ブックマーク無制限", "問題ノート無制限", "1日回答無制限"],
    cta: { href: "/pricing?reason=bookmarks", label: "Proを見る" },
    tier: "pro",
  },
  notes: {
    title: "問題ノートは Pro で解放",
    body: "各問題に自分用メモを残し、復習時に一覧で見返せます。",
    perks: ["ノート無制限", "ブックマーク無制限", "詳細分析"],
    cta: { href: "/pricing?reason=notes", label: "Proを見る" },
    tier: "pro",
  },
  pdf_export: {
    title: "PDF書き出しは Pro で解放",
    body: "弱点レポートと学習履歴を1枚のPDFに出力できます。",
    perks: ["PDFレポート出力", "印刷して紙で復習", "学習履歴の分析"],
    cta: { href: "/pricing?reason=pdf_export", label: "Proを見る" },
    tier: "pro",
  },
  year_locked: {
    title: "この年度は Premium で解放",
    body: "Free/Proは直近年度のみ。Premiumは全年度フルアーカイブです。",
    perks: ["全年度フルアーカイブ", "AI個別解説", "模擬試験最大200問"],
    cta: { href: "/pricing?reason=year_locked", label: "Premiumを見る" },
    tier: "premium",
  },
  ai_explanations: {
    title: "AI個別解説は Premium 限定",
    body: "あなたの誤答パターンに沿って、追加の解説を生成します。",
    perks: ["誤答パターン別AI解説", "全年度フルアーカイブ", "優先サポート"],
    cta: { href: "/pricing?reason=ai_explanations", label: "Premiumを見る" },
    tier: "premium",
  },
  priority_support: {
    title: "優先サポートは Premium 限定",
    body: "メールでの問い合わせに24時間以内で返信します。",
    perks: ["メール24h以内返信", "学習プラン個別相談", "Proの全機能"],
    cta: { href: "/pricing?reason=priority_support", label: "Premiumを見る" },
    tier: "premium",
  },
  ad_free: {
    title: "広告非表示は Pro で解放",
    body: "アップグレードすると学習画面から広告が消えます。",
    perks: ["広告非表示", "1日回答無制限", "詳細分析"],
    cta: { href: "/pricing?reason=ad_free", label: "Proを見る" },
    tier: "pro",
  },
  generic: {
    title: "有料プランの機能です",
    body: "アップグレードで全機能が開放されます。",
    perks: ["問題演習 1日無制限", "詳細分析", "模擬試験"],
    cta: { href: "/pricing", label: "プランを見る" },
    tier: "pro",
  },
};

/**
 * iOS-style bottom sheet modal. Pinned to the bottom on mobile with
 * generous tap area; centered on desktop. Uses a neutral card with only
 * the CTA carrying color.
 */
export function UpgradeModal({
  open,
  onClose,
  reason = "generic",
}: {
  open: boolean;
  onClose: () => void;
  reason?: UpgradeReason;
}) {
  if (!open) return null;
  const copy = REASON_COPY[reason];
  const premium = copy.tier === "premium";

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-up items-end justify-center bg-foreground/40 p-0 backdrop-blur-md md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-card p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-elevated ring-1 ring-black/[0.06] md:rounded-3xl md:pb-6 dark:ring-white/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient gradient halo */}
        <div
          className={`pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl ${
            premium ? "bg-ios-purple/20" : "bg-primary/15"
          }`}
        />

        {/* iOS-style grab handle */}
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ios-gray4 md:hidden" />

        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-[0.92] md:top-4 md:right-4"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          <h2 className="pr-10 text-[22px] font-semibold leading-tight tracking-tight">
            {copy.title}
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
            {copy.body}
          </p>

          <ul className="mt-5 space-y-2.5">
            {copy.perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[14.5px]">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    premium
                      ? "bg-ios-purple/12 text-ios-purple"
                      : "bg-primary/12 text-primary"
                  }`}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={copy.cta.href}
              className={`pill h-12 px-5 text-[15px] ${
                premium
                  ? "bg-ios-purple text-white shadow-tint-purple"
                  : "bg-primary text-primary-foreground shadow-tint-blue"
              }`}
            >
              {copy.cta.label}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="pill-ghost h-12 text-[14px]"
            >
              あとで
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
