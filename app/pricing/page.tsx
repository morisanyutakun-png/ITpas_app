import Link from "next/link";
import { Check } from "lucide-react";
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

const REASON_BANNER: Record<
  string,
  { title: string; body: string; tier: "pro" | "premium" }
> = {
  mock_exam: {
    title: "模擬試験はProプラン以上で解放されます",
    body: "本番形式 100問 / 120分のシミュレーションで時間配分を鍛えます。",
    tier: "pro",
  },
  mock_exam_size: {
    title: "150問・200問の模擬試験はPremium限定です",
    body: "直前の追い込みに、長時間の演習を。",
    tier: "premium",
  },
  advanced_analytics: {
    title: "詳細分析はProプラン以上で解放されます",
    body: "誤解パターンのヒートマップ、論点別の強弱、学習経路の推薦。",
    tier: "pro",
  },
  bookmarks: {
    title: "ブックマーク上限 (3件) に達しました",
    body: "Proなら気になる問題を無制限に保存できます。",
    tier: "pro",
  },
  notes: {
    title: "問題ノートはProプラン以上で解放されます",
    body: "各問題に自分用メモを残し、復習時に一覧で見返せます。",
    tier: "pro",
  },
  pdf_export: {
    title: "PDF書き出しはProプラン以上で解放されます",
    body: "弱点レポートと学習履歴を1枚のPDFに出力。",
    tier: "pro",
  },
  daily_limit: {
    title: "今日の無料回答数 (10問) に達しました",
    body: "Proなら1日無制限。試験日が近いあなたへ。",
    tier: "pro",
  },
  year_locked: {
    title: "この年度はPremiumで解放されます",
    body: "全年度の過去問フルアーカイブはPremium限定。",
    tier: "premium",
  },
  ai_explanations: {
    title: "AI個別解説はPremium限定です",
    body: "あなたの誤答パターンに沿って追加解説を生成。",
    tier: "premium",
  },
  priority_support: {
    title: "優先サポートはPremium限定です",
    body: "メールでの問い合わせに24時間以内で返信。",
    tier: "premium",
  },
  ad_free: {
    title: "広告非表示はProプラン以上で解放されます",
    body: "集中できる学習画面に。",
    tier: "pro",
  },
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; stripe?: string; reason?: string }>;
}) {
  const sp = await searchParams;
  const user = await readCurrentUser();
  const plan: Plan = user?.plan ?? "free";
  const pro = isPro(user);
  const premium = isPremium(user);
  const configured = stripeConfigured();
  const banner = sp.reason ? REASON_BANNER[sp.reason] : undefined;

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <h1 className="text-ios-title1 font-semibold">料金プラン</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">
          まずは Free で毎日10問。本気で合格を狙うなら Pro、試験直前は Premium。
        </p>
      </header>

      {banner && (
        <div
          className={`rounded-2xl p-4 text-[13px] shadow-ios-sm ${
            banner.tier === "premium"
              ? "bg-ios-purple/10 text-ios-purple"
              : "bg-ios-orange/10 text-ios-orange"
          }`}
        >
          <div className="text-[15px] font-semibold text-foreground">
            {banner.title}
          </div>
          <p className="mt-0.5 text-muted-foreground">{banner.body}</p>
        </div>
      )}

      {sp.canceled && (
        <div className="rounded-2xl bg-card p-4 text-[13px] text-muted-foreground shadow-ios-sm">
          決済をキャンセルしました。
        </div>
      )}
      {sp.stripe?.startsWith("missing_") && (
        <div className="rounded-2xl bg-ios-yellow/10 p-4 text-[13px] text-ios-orange shadow-ios-sm">
          価格ID ({sp.stripe}) が環境変数に未設定です。
        </div>
      )}
      {sp.stripe === "unconfigured" && (
        <div className="rounded-2xl bg-ios-yellow/10 p-4 text-[13px] text-ios-orange shadow-ios-sm">
          Stripe の設定が未完了です。
        </div>
      )}

      <div className="space-y-3">
        <PlanCard
          name="Free"
          sub="ずっと無料"
          price="¥0"
          priceSub=""
          tone="muted"
          current={plan === "free"}
          features={[
            "1日10問まで挑戦",
            "誤答の『魅力理由』表示",
            "学習履歴（直近）",
            "ブックマーク 3件まで",
          ]}
          cta={
            plan === "free" ? (
              user?.isSignedIn ? null : (
                <Link
                  href="/api/auth/google/login?returnTo=/"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-foreground text-[15px] font-semibold text-background active:opacity-80"
                >
                  Googleでログインして始める
                </Link>
              )
            ) : (
              <p className="text-center text-[12px] text-muted-foreground">
                ダウングレードはアカウント画面から
              </p>
            )
          }
        />

        <PlanCard
          name="Pro"
          sub="人気"
          price={`¥${PRO_PRICE_JPY_MONTHLY.toLocaleString()}`}
          priceSub={`/月 · 年払い ¥${PRO_PRICE_JPY_YEARLY.toLocaleString()}`}
          tone="primary"
          current={plan === "pro"}
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
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-muted text-[15px] font-semibold text-foreground active:opacity-80"
              >
                アカウント管理
              </Link>
            ) : premium ? (
              <p className="text-center text-[12px] text-muted-foreground">
                Premiumに含まれています
              </p>
            ) : (
              <CheckoutButtons
                tier="pro"
                configured={configured}
                signedIn={!!user?.isSignedIn}
              />
            )
          }
        />

        <PlanCard
          name="Premium"
          sub="試験直前の追い込み"
          price={`¥${PREMIUM_PRICE_JPY_MONTHLY.toLocaleString()}`}
          priceSub={`/月 · 年払い ¥${PREMIUM_PRICE_JPY_YEARLY.toLocaleString()}`}
          tone="purple"
          current={plan === "premium"}
          features={[
            "Proの全機能",
            "全年度の過去問フルアーカイブ",
            "AI解説（誤答パターン別個別解説）",
            "優先サポート（メール・24h以内）",
            "模擬試験を最大200問まで拡張",
            "学習プランの個別カスタマイズ",
          ]}
          cta={
            premium ? (
              <Link
                href="/account"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-muted text-[15px] font-semibold text-foreground active:opacity-80"
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
        />
      </div>

      <section className="space-y-2">
        <div className="ios-section-label">よくある質問</div>
        <div className="ios-list shadow-ios-sm">
          <Faq
            q="解約はいつでもできますか？"
            a="はい。アカウント画面から即時解約でき、解約後も課金期間の最終日までご利用いただけます。"
          />
          <Faq q="支払方法は？" a="Stripeで処理します。クレジットカードに対応しています。" />
          <Faq
            q="無料プランでも過去問は解けますか？"
            a="はい。1日10問まで解けます。誤答の『魅力理由』も含めて核の体験はFreeでお試しいただけます。"
          />
          <Faq
            q="プラン変更 (Pro → Premium) は即時反映されますか？"
            a="Stripeの仕様に従い即時アップグレード＋次回請求で日割り計算されます。"
          />
          <Faq q="領収書は発行できますか？" a="Stripeのアカウントから自動発行されます。" />
        </div>
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
  const isPremium = tier === "premium";
  const primaryBg = isPremium
    ? "bg-ios-purple text-white"
    : "bg-primary text-primary-foreground";
  return (
    <div className="space-y-2">
      <form action={startCheckoutAction}>
        <input type="hidden" name="tier" value={tier} />
        <input type="hidden" name="interval" value="month" />
        <button
          type="submit"
          disabled={!configured}
          className={`inline-flex h-11 w-full items-center justify-center rounded-full ${primaryBg} text-[15px] font-semibold active:opacity-80 disabled:opacity-40`}
        >
          月額でアップグレード
        </button>
      </form>
      <form action={startCheckoutAction}>
        <input type="hidden" name="tier" value={tier} />
        <input type="hidden" name="interval" value="year" />
        <button
          type="submit"
          disabled={!configured}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-muted text-[15px] font-semibold text-foreground active:opacity-80 disabled:opacity-40"
        >
          年額（お得）
        </button>
      </form>
      {!signedIn && (
        <p className="text-center text-[11px] text-muted-foreground">
          お支払いにはGoogleログインが必要です
        </p>
      )}
    </div>
  );
}

function PlanCard({
  name,
  sub,
  price,
  priceSub,
  features,
  cta,
  tone,
  current,
}: {
  name: string;
  sub: string;
  price: string;
  priceSub: string;
  features: string[];
  cta: React.ReactNode;
  tone: "muted" | "primary" | "purple";
  current?: boolean;
}) {
  const accentText =
    tone === "purple"
      ? "text-ios-purple"
      : tone === "primary"
      ? "text-primary"
      : "text-muted-foreground";
  return (
    <div className="rounded-3xl bg-card p-5 shadow-ios-sm">
      <div className="flex items-center gap-2">
        <span className="text-ios-title3 font-semibold">{name}</span>
        <span className={`text-[12px] font-semibold ${accentText}`}>{sub}</span>
        {current && (
          <span className="ml-auto rounded-full bg-ios-green/15 px-2 py-0.5 text-[10px] font-semibold text-ios-green">
            現在のプラン
          </span>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[32px] font-semibold tracking-tight">{price}</span>
        {priceSub && <span className="text-[12px] text-muted-foreground">{priceSub}</span>}
      </div>

      <ul className="mt-4 space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[14px]">
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${accentText}`}
              strokeWidth={2.5}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group">
      <summary className="ios-row cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
        {q}
        <span className="ml-auto text-muted-foreground transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <p className="px-4 pb-3 text-[13px] text-muted-foreground">{a}</p>
    </details>
  );
}
