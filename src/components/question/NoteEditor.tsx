"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Loader2, Lock, NotebookPen } from "lucide-react";
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
      <div className="rounded-2xl bg-card p-5 shadow-ios-sm">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-muted-foreground" />
          <div className="text-[15px] font-medium">自分用メモ</div>
        </div>
        <p className="mt-1 text-[13px] text-muted-foreground">
          ログインすると各問題に自分のメモを残せます。
        </p>
        <a
          href={`/api/auth/google/login?returnTo=${encodeURIComponent(
            `/learn/questions/${questionId}`
          )}`}
          className="mt-3 inline-flex h-10 items-center rounded-full bg-foreground px-4 text-[14px] font-semibold text-background active:opacity-80"
        >
          ログイン
        </a>
      </div>
    );
  }

  if (!isPro) {
    return (
      <Link
        href="/pricing?reason=notes"
        className="flex items-center gap-3 rounded-2xl bg-card p-5 shadow-ios-sm active:opacity-80"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Lock className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold">問題ノートは Pro で解放</div>
          <div className="text-[12px] text-muted-foreground">
            「なぜ間違えた？」のメモを残して即見返せる
          </div>
        </div>
      </Link>
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
    <div className="rounded-2xl bg-card p-5 shadow-ios-sm">
      <div className="flex items-center gap-2">
        <NotebookPen className="h-4 w-4 text-muted-foreground" />
        <div className="text-[15px] font-medium">自分用メモ</div>
        <span className="ml-auto text-[11px] text-muted-foreground">
          この問題だけに保存
        </span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="例: 『署名=本人性』と『暗号化=機密性』の対比で覚える…"
        className="mt-3 w-full rounded-xl bg-muted px-3 py-2.5 text-[15px] focus:bg-muted/80 focus:outline-none"
      />
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[14px] font-semibold text-primary-foreground active:opacity-80 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          保存
        </button>
        {saved === "ok" && (
          <span className="text-[12px] text-ios-green">保存しました</span>
        )}
        {saved === "err" && (
          <span className="text-[12px] text-ios-red">保存に失敗しました</span>
        )}
      </div>
    </div>
  );
}
