import Link from "next/link";
import { Clock, Crown, Lock, ShieldCheck } from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { hasFeature, planLabel } from "@/lib/plan";
import { SupportForm } from "@/components/account/SupportForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "優先サポート" };

export default async function SupportPage() {
  const user = await readCurrentUser();

  if (!user?.isSignedIn) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border-2 border-slate-200 bg-white p-8 text-center space-y-3">
        <Lock className="mx-auto h-8 w-8 text-slate-400" />
        <h1 className="text-lg font-bold">ログインが必要です</h1>
        <p className="text-sm text-slate-600">
          優先サポートを利用するにはGoogleログインしてください。
        </p>
        <Link
          href="/api/auth/google/login?returnTo=/account/support"
          className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 font-bold text-white"
        >
          Googleでログイン
        </Link>
      </div>
    );
  }

  if (!hasFeature(user, "prioritySupport")) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-white p-8 text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <Crown className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold">優先サポートはPremium限定です</h1>
        <p className="text-sm text-slate-600">
          メールでの問い合わせに24時間以内で返信します。内容に応じて学習計画の個別調整もご提案します。
          <br />
          現在のプラン: <strong>{planLabel(user.plan)}</strong>
        </p>
        <Link
          href="/pricing?reason=priority_support"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 font-bold text-white"
        >
          <Crown className="h-4 w-4" />
          Premiumを見る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Premium 優先サポート
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight">お問い合わせ</h1>
        <p className="text-sm text-slate-600 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          24時間以内にご登録メールアドレス ({user.email}) へ返信します。
        </p>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <SupportForm />
      </div>

      <div className="rounded-xl border bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
        <div className="font-bold text-slate-800">受付範囲</div>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>コンテンツに関する質問 (解説の補足、誤植の報告など)</li>
          <li>学習プランの個別カスタマイズ相談</li>
          <li>料金・決済に関するお問い合わせ</li>
          <li>不具合の報告</li>
        </ul>
      </div>
    </div>
  );
}
