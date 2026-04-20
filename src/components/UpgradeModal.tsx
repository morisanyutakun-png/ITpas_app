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
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-0 backdrop-blur-sm md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl bg-card p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-ios-lg md:rounded-3xl md:pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS-style grab handle */}
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-ios-gray4 md:hidden" />

        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground active:opacity-60 md:top-4 md:right-4"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="pr-10 text-ios-title2 font-semibold">{copy.title}</h2>
        <p className="mt-1 text-[14px] text-muted-foreground">{copy.body}</p>

        <ul className="mt-4 space-y-2">
          {copy.perks.map((p) => (
            <li key={p} className="flex items-start gap-2 text-[14px]">
              <Check
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  premium ? "text-ios-purple" : "text-primary"
                }`}
                strokeWidth={2.5}
              />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={copy.cta.href}
            className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-[15px] font-semibold active:opacity-80 ${
              premium
                ? "bg-ios-purple text-white"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {copy.cta.label}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full bg-muted text-[14px] font-medium text-foreground active:opacity-80"
          >
            あとで
          </button>
        </div>
      </div>
    </div>
  );
}
