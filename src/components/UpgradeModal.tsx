"use client";

import Link from "next/link";
import { X, Sparkles, Infinity as InfinityIcon, BarChart3, BookmarkCheck, Download, Timer } from "lucide-react";

export type UpgradeReason =
  | "daily_limit"
  | "mock_exam"
  | "advanced_analytics"
  | "bookmarks"
  | "notes"
  | "pdf_export"
  | "generic";

const REASON_COPY: Record<UpgradeReason, { title: string; body: string }> = {
  daily_limit: {
    title: "今日の無料回答数に達しました",
    body: "Proにアップグレードすると回答数が無制限になります。明日また無料で10問まで解けますが、試験まで時間がないなら…",
  },
  mock_exam: {
    title: "模擬試験はPro限定です",
    body: "100問・120分の本番形式シミュレーションで、当日の時間配分と体力を鍛えられます。",
  },
  advanced_analytics: {
    title: "詳細分析はPro限定です",
    body: "誤解パターン×論点の交差ヒートマップ、日次推移、学習経路の推薦はPro会員にのみ開放しています。",
  },
  bookmarks: {
    title: "ブックマーク上限に達しました",
    body: "無料では3問まで。Proなら無制限に気になる問題を残せます。",
  },
  notes: {
    title: "問題ごとのノートはPro限定です",
    body: "各問題に自分用メモを残し、復習時に一覧で見返せます。",
  },
  pdf_export: {
    title: "PDF書き出しはPro限定です",
    body: "弱点レポートと学習履歴を1枚のPDFに出力して印刷できます。",
  },
  generic: {
    title: "Pro限定の機能です",
    body: "アップグレードで全機能が開放されます。",
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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border-2 border-amber-400 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
          <Sparkles className="h-4 w-4" />
          理解ノート Pro
        </div>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{copy.body}</p>

        <ul className="mt-5 space-y-2 text-sm">
          <Perk icon={InfinityIcon} text="問題演習 1日無制限" />
          <Perk icon={BarChart3} text="詳細ヒートマップ & 日次推移分析" />
          <Perk icon={Timer} text="模擬試験モード (100問 / 120分)" />
          <Perk icon={BookmarkCheck} text="ブックマーク & 問題ノート 無制限" />
          <Perk icon={Download} text="学習レポートをPDF書き出し" />
        </ul>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl"
          >
            Proを見る (¥780/月〜)
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

function Perk({ icon: Icon, text }: { icon: typeof Sparkles; text: string }) {
  return (
    <li className="flex items-center gap-2 text-slate-800">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {text}
    </li>
  );
}
