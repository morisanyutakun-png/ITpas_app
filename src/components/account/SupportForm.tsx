"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitSupportAction } from "@/server/actions/support";

export function SupportForm() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<"idle" | "ok" | "err">("idle");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = (formData: FormData) => {
    setErr(null);
    setMessage("idle");
    startTransition(async () => {
      const res = await submitSupportAction(formData);
      if (res.ok) {
        setMessage("ok");
      } else {
        setMessage("err");
        setErr(
          res.reason === "empty"
            ? "件名と本文を入力してください"
            : res.reason === "too_long"
            ? "入力が長すぎます"
            : res.reason === "premium_only"
            ? "Premium限定機能です"
            : "ログインが必要です"
        );
      }
    });
  };

  if (message === "ok") {
    return (
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 text-sm text-emerald-900 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <div>
          <div className="font-bold">問い合わせを受け付けました</div>
          <p className="text-xs mt-0.5">
            24時間以内にご登録のメールアドレスへ返信いたします。
          </p>
          <button
            type="button"
            onClick={() => setMessage("idle")}
            className="mt-2 text-xs font-semibold underline"
          >
            別の問い合わせを送る
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700">件名</label>
        <input
          name="subject"
          maxLength={200}
          required
          placeholder="例: R07 問23 の選択肢ウの解釈について"
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700">本文</label>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={4000}
          placeholder="ご質問やご要望を詳しくお書きください。スクリーンショットが必要な場合は、返信時にリプライへ添付をお願いします。"
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-400 focus:outline-none"
        />
      </div>
      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {err}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 font-bold text-white disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        送信する
      </button>
    </form>
  );
}
