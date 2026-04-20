import Link from "next/link";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import {
  isPremium,
  isPro,
  PREMIUM_PRICE_JPY_MONTHLY,
  PREMIUM_PRICE_JPY_YEARLY,
  PRO_PRICE_JPY_MONTHLY,
  PRO_PRICE_JPY_YEARLY,
  type Plan,
} from "@/lib/plan";
import { startCheckoutAction } from "@/server/actions/checkout";
import { stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; stripe?: string }>;
}) {
  const sp = await searchParams;
  const user = await readCurrentUser();
  const plan: Plan = user?.plan ?? "free";
  const pro = isPro(user);
  const premium = isPremium(user);
  const configured = stripeConfigured();

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
          <Sparkles className="h-3.5 w-3.5" />
          料金プラン
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          無料で始めて、必要になったらProかPremiumへ
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          まずはFreeで毎日10問。慣れて本気で合格を狙うならPro、試験まで最短ルートで行きたい人向けにPremium。
        </p>
      </div>

      {sp.canceled && (
        <div className="rounded-xl border-2 border-slate-200 bg-white p-4 text-sm text-slate-700">
          決済をキャンセルしました。準備ができたらまたお越しください。
        </div>
      )}
      {sp.stripe?.startsWith("missing_") && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          決済の準備中です。価格ID (<code>{sp.stripe}</code>) が環境変数に未設定です。
        </div>
      )}
      {sp.stripe === "unconfigured" && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Stripeの設定が未完了です。
          <code className="mx-1 rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
            STRIPE_SECRET_KEY
          </code>
          と価格IDを環境変数に設定してください。
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        <PlanCard
          name="Free"
          tag="ずっと無料"
          price="¥0"
          priceSub=""
          features={[
            "1日10問まで挑戦",
            "誤答の『魅力理由』表示",
            "学習履歴 (直近)",
            "ブックマーク 3件まで",
          ]}
          cta={
            plan === "free" ? (
              user?.isSignedIn ? (
                <div className="text-center text-xs text-slate-500">現在のプランです</div>
              ) : (
                <Link
                  href="/api/auth/google/login?returnTo=/"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
                >
                  Googleでログインして始める
                </Link>
              )
            ) : (
              <div className="text-center text-xs text-slate-500">ダウングレードはアカウント画面から</div>
            )
          }
          current={plan === "free"}
        />

        <PlanCard
          highlight
          name="Pro"
          tag="人気"
          price={`¥${PRO_PRICE_JPY_MONTHLY.toLocaleString()}`}
          priceSub={`/月  ·  年払い ¥${PRO_PRICE_JPY_YEARLY.toLocaleString()}`}
          features={[
            "問題演習 1日無制限",
            "詳細ヒートマップ / 日次推移 / 推薦学習",
            "模擬試験モード (100問 / 120分)",
            "ブックマーク & 問題ノート 無制限",
            "学習レポートをPDFで書き出し",
            "広告非表示",
          ]}
          cta={
            pro && !premium ? (
              <Link
                href="/account"
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
              >
                アカウント管理
              </Link>
            ) : premium ? (
              <div className="text-center text-xs text-slate-500">Premiumに含まれています</div>
            ) : (
              <CheckoutButtons tier="pro" configured={configured} signedIn={!!user?.isSignedIn} />
            )
          }
          current={plan === "pro"}
        />

        <PlanCard
          premium
          name="Premium"
          tag="試験直前の追い込みに"
          price={`¥${PREMIUM_PRICE_JPY_MONTHLY.toLocaleString()}`}
          priceSub={`/月  ·  年払い ¥${PREMIUM_PRICE_JPY_YEARLY.toLocaleString()}`}
          features={[
            "Proのすべての機能",
            "全年度の過去問フルアーカイブ",
            "AI解説 (誤答パターンに合わせた個別解説)",
            "優先サポート (メール・24h以内返信)",
            "模擬試験は最大200問まで拡張",
            "学習プランの個別カスタマイズ",
          ]}
          cta={
            premium ? (
              <Link
                href="/account"
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
              >
                アカウント管理
              </Link>
            ) : (
              <CheckoutButtons
                tier="premium"
                configured={configured}
                signedIn={!!user?.isSignedIn}
              />
            )
          }
          current={plan === "premium"}
        />
      </div>

      <section className="rounded-2xl border bg-white p-6 space-y-3">
        <h2 className="text-lg font-bold">よくある質問</h2>
        <Faq q="解約はいつでもできますか？" a="はい。アカウント画面から即時解約でき、解約後も課金期間の最終日までProまたはPremiumが使えます。" />
        <Faq q="支払方法は？" a="Stripeで処理します。クレジットカードに対応しています。" />
        <Faq q="無料プランでも過去問は解けますか？" a="はい。1日10問まで解けます。誤答の『魅力理由』表示も含めて核の体験はFreeでお試しいただけます。" />
        <Faq q="プラン変更 (Pro → Premium) は即時反映されますか？" a="Stripe の仕様に従い、即時アップグレード＋次回請求で日割り計算されます。Premium → Pro のダウングレードも同様。" />
        <Faq q="領収書は発行できますか？" a="Stripeのアカウントから自動発行されます。請求履歴もすべて取得できます。" />
      </section>
    </div>
  );
}

function CheckoutButtons({
  tier,
  configured,
  signedIn,
}: {
  tier: "pro" | "premium";
  configured: boolean;
  signedIn: boolean;
}) {
  const Icon = tier === "premium" ? Crown : Zap;
  const monthColor =
    tier === "premium"
      ? "from-violet-600 to-fuchsia-600"
      : "from-amber-500 to-orange-500";
  const yearBorder =
    tier === "premium" ? "border-violet-400 text-violet-700" : "border-amber-400 text-amber-700";

  return (
    <div className="space-y-2">
      <form action={startCheckoutAction}>
        <input type="hidden" name="tier" value={tier} />
        <input type="hidden" name="interval" value="month" />
        <button
          type="submit"
          disabled={!configured}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${monthColor} px-5 py-3 font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50`}
        >
          <Icon className="h-4 w-4" />
          月額でアップグレード
        </button>
      </form>
      <form action={startCheckoutAction}>
        <input type="hidden" name="tier" value={tier} />
        <input type="hidden" name="interval" value="year" />
        <button
          type="submit"
          disabled={!configured}
          className={`inline-flex w-full items-center justify-center rounded-xl border-2 ${yearBorder} bg-white px-5 py-3 font-bold transition hover:bg-slate-50 disabled:opacity-50`}
        >
          年額 (お得)
        </button>
      </form>
      {!signedIn && (
        <p className="text-center text-xs text-slate-500">
          お支払いにはGoogleログインが必要です
        </p>
      )}
    </div>
  );
}

function PlanCard({
  name,
  tag,
  price,
  priceSub,
  features,
  cta,
  highlight,
  premium,
  current,
}: {
  name: string;
  tag: string;
  price: string;
  priceSub: string;
  features: string[];
  cta: React.ReactNode;
  highlight?: boolean;
  premium?: boolean;
  current?: boolean;
}) {
  const border = premium
    ? "border-violet-400 bg-gradient-to-br from-violet-50 to-white shadow-xl"
    : highlight
      ? "border-amber-400 bg-gradient-to-br from-amber-50 to-white shadow-xl"
      : "border-slate-200 bg-white";
  return (
    <div className={`relative rounded-3xl border-2 p-6 ${border}`}>
      {current && (
        <div className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          現在のプラン
        </div>
      )}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>{name}</span>
        {tag && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${
            premium ? "bg-violet-100 text-violet-700" : highlight ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
          }`}>
            {tag}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-4xl font-black tracking-tight text-slate-900">{price}</div>
        {priceSub && <div className="text-sm text-slate-500">{priceSub}</div>}
      </div>

      <ul className="mt-5 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-800">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-6">{cta}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-xl border bg-slate-50 px-4 py-3">
      <summary className="cursor-pointer font-semibold text-slate-900">{q}</summary>
      <p className="mt-2 text-sm text-slate-700">{a}</p>
    </details>
  );
}
