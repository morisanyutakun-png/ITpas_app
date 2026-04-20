"use client";

import { useState, useTransition } from "react";
import { Loader2, NotebookPen, Sparkles, Save } from "lucide-react";
import Link from "next/link";
import { saveNoteAction } from "@/server/actions/notes";

export function NoteEditor({
  questionId,
  initialBody,
  signedIn,
  isPro,
}: {
  questionId: string;
  initialBody: string;
  signedIn: boolean;
  isPro: boolean;
}) {
  const [body, setBody] = useState(initialBody);
  const [saved, setSaved] = useState<"idle" | "ok" | "err">("idle");
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm">
        <NotebookPen className="mx-auto h-6 w-6 text-slate-400" />
        <div className="mt-1 font-semibold">自分用メモ</div>
        <p className="mt-0.5 text-xs text-slate-500">
          ログインすると各問題に自分のメモを残せます (Pro)
        </p>
        <a
          href={`/api/auth/google/login?returnTo=${encodeURIComponent(
            `/learn/questions/${questionId}`
          )}`}
          className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
        >
          ログイン
        </a>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-center text-sm">
        <Sparkles className="mx-auto h-6 w-6 text-amber-500" />
        <div className="mt-1 font-bold text-amber-900">
          問題ごとのノートはPro限定です
        </div>
        <p className="mt-0.5 text-xs text-amber-800">
          「なぜ間違えた？」のメモを残して、復習時に即見返せる
        </p>
        <Link
          href="/pricing"
          className="mt-3 inline-flex rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white"
        >
          Proを見る
        </Link>
      </div>
    );
  }

  const onSave = () => {
    setSaved("idle");
    startTransition(async () => {
      const res = await saveNoteAction({ questionId, body });
      setSaved(res.ok ? "ok" : "err");
    });
  };

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-bold">
        <NotebookPen className="h-4 w-4 text-slate-700" />
        自分用メモ
        <span className="ml-auto text-[10px] font-normal text-slate-500">
          この問題にだけ保存されます
        </span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="例: 『署名=本人性』と『暗号化=機密性』の対比で覚える…"
        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          保存
        </button>
        {saved === "ok" && <span className="text-xs text-emerald-700">保存しました</span>}
        {saved === "err" && <span className="text-xs text-rose-700">保存に失敗しました</span>}
      </div>
    </div>
  );
}
