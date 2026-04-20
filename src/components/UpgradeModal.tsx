"use client";

import Link from "next/link";
import {
  X,
  Sparkles,
  Infinity as InfinityIcon,
  BarChart3,
  BookmarkCheck,
  Download,
  Timer,
  Crown,
  Wand2,
  CalendarRange,
  ShieldCheck,
} from "lucide-react";

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
  cta: { href: string; label: string };
  tier: "pro" | "premium";
};

const REASON_COPY: Record<UpgradeReason, Copy> = {
  daily_limit: {
    title: "今日の無料回答数に達しました",
    body: "Proにアップグレードすると回答数が無制限になります。明日また無料で10問まで解けますが、試験まで時間がないなら…",
    cta: { href: "/pricing?reason=daily_limit", label: "Proを見る (¥780/月〜)" },
    tier: "pro",
  },
  mock_exam: {
    title: "模擬試験はProプラン以上で解放されます",
    body: "100問・120分の本番形式シミュレーションで、当日の時間配分と体力を鍛えられます。",
    cta: { href: "/pricing?reason=mock_exam", label: "Proを見る (¥780/月〜)" },
    tier: "pro",
  },
  mock_exam_size: {
    title: "150問・200問の模擬試験はPremiumで解放されます",
    body: "Proは100問まで、Premiumでは最大200問まで拡張可能。本番前の追い込みに。",
    cta: { href: "/pricing?reason=mock_exam_size", label: "Premiumを見る" },
    tier: "premium",
  },
  advanced_analytics: {
    title: "詳細分析はPro限定です",
    body: "誤解パターン×論点の交差ヒートマップ、日次推移、学習経路の推薦はProプラン以上に開放しています。",
    cta: { href: "/pricing?reason=advanced_analytics", label: "Proを見る" },
    tier: "pro",
  },
  bookmarks: {
    title: "ブックマーク上限に達しました",
    body: "無料では3問まで。Proなら無制限に気になる問題を残せます。",
    cta: { href: "/pricing?reason=bookmarks", label: "Proを見る" },
    tier: "pro",
  },
  notes: {
    title: "問題ごとのノートはPro限定です",
    body: "各問題に自分用メモを残し、復習時に一覧で見返せます。",
    cta: { href: "/pricing?reason=notes", label: "Proを見る" },
    tier: "pro",
  },
  pdf_export: {
    title: "PDF書き出しはPro限定です",
    body: "弱点レポートと学習履歴を1枚のPDFに出力して印刷できます。",
    cta: { href: "/pricing?reason=pdf_export", label: "Proを見る" },
    tier: "pro",
  },
  year_locked: {
    title: "この年度の過去問はPremiumで解放されます",
    body: "Free/Proでは直近年度に絞って表示しています。Premiumは全年度フルアーカイブ。",
    cta: { href: "/pricing?reason=year_locked", label: "Premiumを見る" },
    tier: "premium",
  },
  ai_explanations: {
    title: "AI個別解説はPremium限定です",
    body: "あなたの誤答パターンに沿って、追加の解説を生成します。丸暗記を崩す最後の一押しに。",
    cta: { href: "/pricing?reason=ai_explanations", label: "Premiumを見る" },
    tier: "premium",
  },
  priority_support: {
    title: "優先サポートはPremium限定です",
    body: "メールでの問い合わせに24時間以内で返信。学習プランの個別カスタマイズもご相談可能です。",
    cta: { href: "/pricing?reason=priority_support", label: "Premiumを見る" },
    tier: "premium",
  },
  ad_free: {
    title: "広告非表示はProプラン以上で解放されます",
    body: "アップグレードすると学習画面から広告が消えます。集中して解きたい人へ。",
    cta: { href: "/pricing?reason=ad_free", label: "Proを見る" },
    tier: "pro",
  },
  generic: {
    title: "有料プランの機能です",
    body: "アップグレードで全機能が開放されます。",
    cta: { href: "/pricing", label: "プランを見る" },
    tier: "pro",
  },
};

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-3xl border-2 bg-white p-6 shadow-2xl ${
          premium ? "border-violet-400" : "border-amber-400"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </button>

        <div
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
            premium ? "text-violet-700" : "text-amber-700"
          }`}
        >
          {premium ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {premium ? "理解ノート Premium" : "理解ノート Pro"}
        </div>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{copy.body}</p>

        <ul className="mt-5 space-y-2 text-sm">
          {premium ? (
            <>
              <Perk icon={CalendarRange} text="全年度の過去問フルアーカイブ" tier="premium" />
              <Perk icon={Wand2} text="AI個別解説 (誤答パターンに合わせた追加解説)" tier="premium" />
              <Perk icon={Timer} text="模擬試験を最大200問まで拡張" tier="premium" />
              <Perk icon={ShieldCheck} text="優先サポート (メール24h以内)" tier="premium" />
              <Perk icon={BarChart3} text="Proの全機能 (詳細分析・PDF出力)" tier="premium" />
            </>
          ) : (
            <>
              <Perk icon={InfinityIcon} text="問題演習 1日無制限" tier="pro" />
              <Perk icon={BarChart3} text="詳細ヒートマップ & 日次推移分析" tier="pro" />
              <Perk icon={Timer} text="模擬試験モード (100問 / 120分)" tier="pro" />
              <Perk icon={BookmarkCheck} text="ブックマーク & 問題ノート 無制限" tier="pro" />
              <Perk icon={Download} text="学習レポートをPDF書き出し" tier="pro" />
            </>
          )}
        </ul>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={copy.cta.href}
            className={`inline-flex items-center justify-center rounded-xl px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl ${
              premium
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600"
                : "bg-gradient-to-r from-amber-500 to-orange-500"
            }`}
          >
            {copy.cta.label}
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            あとで
          </button>
        </div>
      </div>
    </div>
  );
}

function Perk({
  icon: Icon,
  text,
  tier,
}: {
  icon: typeof Sparkles;
  text: string;
  tier: "pro" | "premium";
}) {
  const cls =
    tier === "premium"
      ? "bg-violet-100 text-violet-700"
      : "bg-amber-100 text-amber-700";
  return (
    <li className="flex items-center gap-2 text-slate-800">
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${cls}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      {text}
    </li>
  );
}
