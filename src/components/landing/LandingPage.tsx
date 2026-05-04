import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronDown,
  Clock,
  Eye,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  PlayCircle,
  Quote,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { TryOneQuestion } from "./TryOneQuestion";
import { HeatmapMock } from "./mocks";

/**
 * Marketing landing page for signed-out visitors — ToC 向けに刷新。
 *
 * 構成: Hero → できること → 1問体験 → よくある悩み → 違い → 学習フロー
 *      → 料金 → FAQ → 最終 CTA
 *
 * 設計方針:
 *  - Hero は「自分向けだ」と一瞬で伝わる共感コピー。CTA は「無料で1問試す」が主。
 *  - 1問体験 (TryOneQuestion) を Hero 直下に置き、サインイン前に価値を体験させる。
 *  - コピーは「診断 / 可視化」より「見える / ラクになる / 受かる」のベネフィット側で。
 *  - 配色は青系を主軸。sunset gradient は「魅力理由」シグネチャーの保持にだけ使用。
 */
export function LandingPage() {
  return (
    <div className="space-y-20 pb-6 md:space-y-28">
      <HeroSection />
      <ValuePropsSection />
      <TrySection />
      <PainsAndSolutionsSection />
      <DifferentiationSection />
      <FeatureHighlightSection />
      <HowItWorksSection />
      <PricingTeaserSection />
      <FaqSection />
      <FinalCtaSection />
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative">
      {/* Soft blue ambient — clean, education-app feel */}
      <div className="pointer-events-none absolute inset-x-0 -top-12 -z-10 h-[560px] overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[460px] w-[920px] -translate-x-1/2 rounded-full bg-grad-ocean opacity-15 blur-3xl" />
        <div className="absolute left-[8%] top-24 h-[220px] w-[220px] rounded-full bg-ios-blue/25 blur-3xl" />
        <div className="absolute right-[6%] top-12 h-[200px] w-[200px] rounded-full bg-ios-mint/20 blur-3xl" />
      </div>

      <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <div className="relative z-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ios-blue ring-1 ring-ios-blue/15 backdrop-blur">
            <Sparkles className="h-3 w-3" />
            ITパスポート 学習アプリ
          </div>
          <h1 className="mt-4 text-[36px] font-semibold leading-[1.12] tracking-tight text-balance sm:text-[46px] md:text-[52px]">
            ITパスポート、
            <br className="hidden sm:inline" />
            <span className="bg-grad-ocean bg-clip-text text-transparent">
              暗記だけ
            </span>
            で疲れていませんか？
          </h1>
          <p className="mt-5 max-w-xl text-[15.5px] leading-[1.85] text-muted-foreground text-pretty">
            ITpass は、
            <span className="font-semibold text-foreground">
              「なぜ間違えたか」が分かる
            </span>
            学習アプリ。
            <br className="hidden sm:inline" />
            似た用語の混同や、引っかかりやすい選択肢の正体を見える化して、
            <span className="font-semibold text-foreground">
              理解で合格に近づきます
            </span>
            。
          </p>

          {/* Primary CTA: try first */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#try"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-tint-blue transition active:scale-[0.98]"
            >
              <PlayCircle className="h-4 w-4" />
              まず1問、無料で試す
            </a>
            <Link
              href="/api/auth/google/login?returnTo=/home"
              className="inline-flex h-12 items-center gap-1.5 rounded-full bg-card px-5 text-[14px] font-semibold text-foreground ring-1 ring-black/[0.06] shadow-ios-sm transition active:scale-[0.98] dark:ring-white/[0.08]"
            >
              Googleで始める
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
            <li className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-ios-green" strokeWidth={3} />
              無料登録ですぐ使える
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-ios-green" strokeWidth={3} />
              クレカ不要
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-ios-green" strokeWidth={3} />
              スマホ対応
            </li>
          </ul>
        </div>

        {/* Hero visual: a snapshot of the signature feature */}
        <div className="relative animate-fade-up [animation-delay:120ms]">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Phone-like frame to feel "app-y" rather than "website-y" */}
      <div className="relative overflow-hidden rounded-[28px] bg-card p-4 shadow-hero ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
        {/* Status bar mock */}
        <div className="flex items-center justify-between px-2 pb-3 text-[10px] font-medium text-muted-foreground">
          <span>9:41</span>
          <span>ITpass</span>
        </div>

        {/* Question card */}
        <div className="rounded-2xl bg-muted/50 p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold">
            <span className="rounded-full bg-foreground px-2 py-0.5 text-background">
              過去問
            </span>
            <span className="rounded-full bg-grad-green px-2 py-0.5 text-white">
              テクノロジ
            </span>
            <span className="num ml-auto text-[10.5px] text-muted-foreground">
              R6秋 問12
            </span>
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed">
            <span className="font-semibold">ワーム</span>の特徴として適切なものは？
          </p>
        </div>

        {/* Wrong choice highlighted */}
        <div className="mt-2.5 flex items-center gap-2.5 rounded-2xl bg-ios-red/5 p-3 ring-1 ring-ios-red/25">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ios-red text-[12px] font-semibold text-white">
            イ
          </span>
          <span className="flex-1 text-[12px] leading-snug">
            正常なファイルに寄生する
          </span>
        </div>

        {/* Why-attractive callout (the signature moment) */}
        <div className="relative mt-2.5 overflow-hidden rounded-2xl p-4 shadow-ios ring-1 ring-ios-orange/25">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#FFF2E0] via-[#FFE4C4] to-[#FFD9B3] dark:from-[#3b2a15] dark:via-[#2d1f10] dark:to-[#25180b]" />
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-grad-sunset text-[12px] font-semibold text-white shadow-tint-orange">
              イ
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
                <Sparkles className="h-3 w-3" />
                なぜ引き寄せられたか
              </div>
              <p className="mt-1 text-[12px] leading-snug text-foreground/90">
                ウイルスの「寄生」イメージから混同。実は寄生はウイルス、ワームは
                <span className="font-semibold">単独で増える</span>のが本質。
              </p>
            </div>
          </div>
          <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-ios-orange/15 px-2 py-0.5 text-[10px] font-semibold text-ios-orange">
            <Target className="h-2.5 w-2.5" />
            言い換え罠 型
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Value props (3 cards) ───────────────────────────────────────────────

function ValuePropsSection() {
  const items = [
    {
      icon: Eye,
      title: "なぜ間違えたかが、毎回わかる",
      desc: "誤答の選択肢ひとつずつに「なぜ引き寄せられたか」が書いてあるから、自分の思考のクセが見えます。",
      hue: "#0A84FF",
      hueDim: "rgba(10,132,255,0.10)",
    },
    {
      icon: Target,
      title: "苦手をピンポイントで潰せる",
      desc: "「言い換え罠」「階層混同」など5つの型で苦手を分類。出題範囲を闇雲に回さず、効く所から崩します。",
      hue: "#FF9500",
      hueDim: "rgba(255,149,0,0.10)",
    },
    {
      icon: BrainCircuit,
      title: "丸暗記を抜け出せる",
      desc: "似た用語の違いを「型」で覚えるから、本番で言い換えられても落ち着いて見抜けるようになります。",
      hue: "#34C759",
      hueDim: "rgba(52,199,89,0.10)",
    },
  ];
  return (
    <section className="space-y-7">
      <SectionHead
        kicker="What you get"
        title="ITpass を使うと、3つのことが変わります"
        desc="難しい学習理論ではなく、やったその日から実感できる変化です。"
      />
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.title}
            className="surface-card relative overflow-hidden p-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-[0.16] blur-2xl"
              style={{ background: it.hue }}
            />
            <span
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: it.hueDim, color: it.hue }}
            >
              <it.icon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <h3 className="relative mt-4 text-[18px] font-semibold leading-tight tracking-tight">
              {it.title}
            </h3>
            <p className="relative mt-2 text-[13.5px] leading-[1.8] text-muted-foreground text-pretty">
              {it.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Try one question (login-free) ───────────────────────────────────────

function TrySection() {
  return (
    <section id="try" className="scroll-mt-24 space-y-6">
      <SectionHead
        kicker="Try it"
        title="まず、1問だけ解いてみてください"
        desc="ログイン不要。30秒で「他の過去問アプリと何が違うか」が分かります。"
      />
      <TryOneQuestion />
    </section>
  );
}

// ── Pains → Solutions ──────────────────────────────────────────────────

function PainsAndSolutionsSection() {
  const pains = [
    {
      pain: "似た用語が多すぎて混乱する",
      sol: "ITpass は誤答ごとに「どこで取り違えやすいか」を解説。違いが頭に残ります。",
    },
    {
      pain: "暗記しても本番で崩れる",
      sol: "言い換えに耐える「型」で覚える設計。問題文が変わっても判別できます。",
    },
    {
      pain: "どこから手をつければいいか分からない",
      sol: "弱点は5つの型で自動分類。赤い所から5問ずつ潰せば、効率よく強くなれます。",
    },
    {
      pain: "解説を読んでもいまいちピンとこない",
      sol: "正解だけでなく、誤答ごとに「なぜ魅力的に見えたか」を言語化。腑に落ちます。",
    },
  ];
  return (
    <section className="space-y-7">
      <SectionHead
        kicker="Pain → Relief"
        title="こんな悩みに、効きます"
        desc="ITパスポート受験者からよく聞く悩みを、ITpass はどう解決するか。"
      />
      <div className="grid gap-3 md:grid-cols-2">
        {pains.map((p) => (
          <div
            key={p.pain}
            className="surface-card flex flex-col gap-3 p-5 sm:p-6"
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Quote className="h-3.5 w-3.5" />
              </span>
              <p className="text-[15px] font-semibold leading-snug tracking-tight">
                「{p.pain}」
              </p>
            </div>
            <div className="flex items-start gap-2.5 rounded-2xl bg-ios-blue/8 p-3.5 ring-1 ring-ios-blue/20">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ios-blue text-white">
                <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
              <p className="text-[13.5px] leading-relaxed text-foreground/90 text-pretty">
                {p.sol}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Differentiation ─────────────────────────────────────────────────────

function DifferentiationSection() {
  const rows = [
    {
      label: "問題演習",
      others: "問題を解いて、解説を読む",
      itpass: "誤答ごとに「なぜ引き寄せられたか」が読める",
    },
    {
      label: "苦手の見つけ方",
      others: "正答率の低い分野を眺める",
      itpass: "「言い換え罠」など5つの型で苦手を分類",
    },
    {
      label: "復習のしかた",
      others: "もう一度同じ問題を解く",
      itpass: "苦手の型ごとに、関連する5問で集中演習",
    },
    {
      label: "本番での強さ",
      others: "見たことある問題に強い",
      itpass: "言い換えられても、型で見抜ける",
    },
  ];
  return (
    <section className="space-y-7">
      <SectionHead
        kicker="What makes us different"
        title="ふつうの過去問アプリとの違い"
        desc="量を回すサービスではなく、1問あたりの理解の深さで勝つサービスです。"
      />
      <div className="surface-card overflow-hidden p-0">
        <div className="grid grid-cols-[1fr_1fr_1.2fr] border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <div className="px-4 py-3">項目</div>
          <div className="px-4 py-3">他の過去問アプリ</div>
          <div className="px-4 py-3 text-ios-blue">ITpass</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={[
              "grid grid-cols-[1fr_1fr_1.2fr] gap-0 text-[13px]",
              i < rows.length - 1 ? "border-b border-border/40" : "",
            ].join(" ")}
          >
            <div className="px-4 py-4 font-semibold text-foreground/90">
              {r.label}
            </div>
            <div className="px-4 py-4 text-muted-foreground">{r.others}</div>
            <div className="flex items-start gap-2 px-4 py-4 text-foreground">
              <Check
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ios-blue"
                strokeWidth={3}
              />
              <span className="font-medium leading-snug">{r.itpass}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="px-1 text-center text-[12px] text-muted-foreground text-pretty">
        ※ 他社サービスを否定する意図はありません。学習スタイルの違いとしての比較です。
      </p>
    </section>
  );
}

// ── Feature highlight (heatmap) ────────────────────────────────────────

function FeatureHighlightSection() {
  return (
    <section className="space-y-7">
      <SectionHead
        kicker="Inside the app"
        title="自分の弱点が、地図のように見える"
        desc="どの「型」でつまずいているかが一目で分かるから、勉強の優先順位に迷いません。"
      />
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-14">
        <div className="space-y-4">
          <ul className="space-y-3.5">
            {[
              {
                icon: BarChart3,
                title: "型ごとの誤答率を可視化",
                body: "「言い換え罠」「階層混同」など、つまずきの種類別に苦手度が並ぶ。",
              },
              {
                icon: Target,
                title: "弱点を5問で潰す",
                body: "赤い項目をタップ → 関連問題が自動で5問。短時間で着実に強くなれる。",
              },
              {
                icon: Layers,
                title: "概念マップで現在地を確認",
                body: "試験範囲のどこが習熟済みで、どこが空白かが地図で分かる。",
              },
            ].map((it) => (
              <li
                key={it.title}
                className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-surface ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ios-blue/10 text-ios-blue">
                  <it.icon className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div className="min-w-0">
                  <div className="text-[14.5px] font-semibold tracking-tight">
                    {it.title}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
                    {it.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <HeatmapMock />
        </div>
      </div>
    </section>
  );
}

// ── How it works (3 steps) ─────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      title: "1問解く",
      desc: "気軽に1問。スキマ時間でOK。",
      icon: PlayCircle,
      tile: "bg-grad-ocean",
    },
    {
      n: "02",
      title: "間違えた理由を見る",
      desc: "誤答の「なぜ魅力的か」を読んで、自分のクセを言語化。",
      icon: Eye,
      tile: "bg-grad-sunset",
    },
    {
      n: "03",
      title: "苦手を5問でつぶす",
      desc: "同じ型の罠を集中演習。次に出ても見抜けるようになる。",
      icon: Target,
      tile: "bg-grad-green",
    },
  ];
  return (
    <section className="space-y-6">
      <SectionHead
        kicker="How it works"
        title="3ステップで、勉強がラクになる"
        desc="1日10分でも、回し続ければ確実に積み上がります。"
      />
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.n} className="surface-card relative overflow-hidden p-6">
            <div className="flex items-center gap-3">
              <span className={`tile-icon ${s.tile}`}>
                <s.icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Step {i + 1}
                </div>
                <div className="text-[20px] font-semibold tracking-tight">
                  {s.title}
                </div>
              </div>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground text-pretty">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Pricing teaser ───────────────────────────────────────────────────────

function PricingTeaserSection() {
  const proHref = `/api/auth/google/login?returnTo=${encodeURIComponent(
    "/api/checkout/start?tier=pro"
  )}`;
  const plans = [
    {
      tier: "Free",
      price: "¥0",
      priceNote: "ずっと無料",
      headline: "まず試す人へ",
      perks: [
        "1日10問まで演習",
        "誤答の魅力理由・解説が読める",
        "誤解パターン辞典の閲覧",
        "コンセプトマップで現在地確認",
      ],
      cta: { href: "/api/auth/google/login?returnTo=/home", label: "無料で始める" },
      tone: "default" as const,
    },
    {
      tier: "Pro",
      price: "¥780",
      priceNote: "月額・いつでも解約可",
      headline: "本気で受かりたい人へ",
      perks: [
        "問題演習が無制限",
        "誤解パターン別ヒートマップ",
        "模擬試験 (100問・120分)",
        "ブックマーク・ノート無制限",
        "広告非表示",
      ],
      cta: { href: proHref, label: "Proを始める" },
      tone: "featured" as const,
    },
  ];
  return (
    <section className="space-y-6">
      <SectionHead
        kicker="Pricing"
        title="まずは無料で。納得したらPro。"
        desc="Free でアプリの感触を試して、本番が近くなったら Pro に。いつでも解約できます。"
      />
      <div className="mx-auto grid max-w-3xl gap-3 md:grid-cols-2">
        {plans.map((p) => (
          <div
            key={p.tier}
            className={[
              "relative overflow-hidden rounded-3xl p-6 ring-1",
              p.tone === "featured"
                ? "bg-grad-ink text-white shadow-hero ring-white/10"
                : "surface-card",
            ].join(" ")}
          >
            {p.tone === "featured" && (
              <>
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
                <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white ring-1 ring-inset ring-white/30 backdrop-blur">
                  <Sparkles className="h-3 w-3" />
                  おすすめ
                </span>
              </>
            )}
            <div className="relative z-10">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                {p.tier}
              </div>
              <div className="mt-1 text-[14px] font-semibold opacity-95">
                {p.headline}
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="num text-[34px] font-semibold tracking-tight">
                  {p.price}
                </span>
                <span className="text-[12px] opacity-75">{p.priceNote}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {p.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-2 text-[13.5px] leading-relaxed"
                  >
                    <Check
                      className={[
                        "mt-0.5 h-3.5 w-3.5 shrink-0",
                        p.tone === "featured" ? "text-ios-mint" : "text-ios-green",
                      ].join(" ")}
                      strokeWidth={3}
                    />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                href={p.cta.href}
                className={[
                  "mt-6 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-4 text-[14.5px] font-semibold transition-transform active:scale-[0.98]",
                  p.tone === "featured"
                    ? "bg-white text-foreground shadow-ios"
                    : "bg-foreground text-background shadow-ios",
                ].join(" ")}
              >
                {p.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="px-1 text-center text-[12px] text-muted-foreground">
        詳細は{" "}
        <Link href="/pricing" className="font-semibold text-primary hover:underline">
          料金ページ
        </Link>
        。Premium プラン (¥1,980 / 月) もあります。
      </div>
    </section>
  );
}

// ── FAQ ─────────────────────────────────────────────────────────────────

function FaqSection() {
  const faqs = [
    {
      q: "本当に無料で使えますか？",
      a: "はい。Google ログインだけで、その日から1日10問まで無料で演習できます。クレジットカードの登録は不要です。",
    },
    {
      q: "他のITパス過去問アプリと何が違うんですか？",
      a: "正解の解説に加えて、間違いの選択肢ごとに「なぜ魅力的に見えたか」が読めることです。自分の思考のクセが言語化され、似た問題が出ても引っかからなくなります。",
    },
    {
      q: "IPA公式のサービスですか？",
      a: "いいえ。ITpass は IPA (情報処理推進機構) の公式サービスではなく、ITパスポート受験者向けの学習支援サービスです。試験問題は IPA の著作物で、出典を明記して引用しています。",
    },
    {
      q: "スマホからも使えますか？",
      a: "はい。スマホでもアプリのように使えます (PWA 対応予定)。通勤中や休憩時間に1問ずつ演習できます。",
    },
    {
      q: "Pro は途中で解約できますか？",
      a: "いつでも解約できます。Stripe 経由の月額制で、解約後はその月の終わりまで Pro 機能が使え、その後 Free に戻ります。",
    },
    {
      q: "問題は何問ありますか？",
      a: "令和元年〜直近までの IPA 過去問 740問を構造化済みです。すべての誤答に「魅力理由」が書かれています。",
    },
  ];
  return (
    <section className="space-y-7">
      <SectionHead
        kicker="FAQ"
        title="よくあるご質問"
        desc="申し込み前に気になる点をまとめました。"
      />
      <div className="mx-auto max-w-3xl space-y-2.5">
        {faqs.map((f, i) => (
          <details
            key={f.q}
            className="group surface-card overflow-hidden p-0 [&_summary::-webkit-details-marker]:hidden"
            {...(i === 0 ? { open: true } : {})}
          >
            <summary className="flex cursor-pointer list-none items-start gap-3 p-5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ios-blue/10 text-ios-blue">
                <HelpCircle className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <span className="flex-1 text-[14.5px] font-semibold leading-snug tracking-tight">
                {f.q}
              </span>
              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 pl-[60px] text-[13.5px] leading-[1.85] text-muted-foreground text-pretty">
              {f.a}
            </div>
          </details>
        ))}
      </div>

      {/* Trust footnote */}
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-1 text-center text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-ios-green" />
          IPA 著作権を尊重・出典明記
        </span>
        <span className="inline-flex items-center gap-1.5">
          <GraduationCap className="h-3.5 w-3.5 text-ios-blue" />
          理解重視で設計
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-ios-purple" />
          Google アカウント認証のみ
        </span>
        <Link href="/legal" className="underline-offset-2 hover:underline">
          著作権・引用について
        </Link>
      </div>
    </section>
  );
}

// ── Final CTA ────────────────────────────────────────────────────────────

function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-grad-ocean p-8 text-white shadow-hero md:p-14">
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-85">
          Start today
        </div>
        <h2 className="mt-2 text-[30px] font-semibold leading-tight tracking-tight text-balance md:text-[40px]">
          暗記をやめて、
          <br className="hidden sm:inline" />
          理解で受かる学習を、今日から。
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed opacity-90 text-pretty">
          まずは無料で1問。気に入ったら Google ログインで進捗を保存。
          <br className="hidden sm:inline" />
          クレカ不要・いつでも解約OKです。
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#try"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-foreground shadow-ios transition active:scale-[0.98]"
          >
            <PlayCircle className="h-4 w-4" />
            まず1問、無料で試す
          </a>
          <Link
            href="/api/auth/google/login?returnTo=/home"
            className="inline-flex h-12 items-center gap-1.5 rounded-full bg-white/15 px-5 text-[14px] font-semibold text-white ring-1 ring-inset ring-white/30 backdrop-blur"
          >
            Googleで始める
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-[11.5px] opacity-85">
          <Clock className="h-3.5 w-3.5" />
          所要 30 秒・登録は Google ボタン1クリック
        </div>
      </div>
    </section>
  );
}

// ── Shared section head ──────────────────────────────────────────────────

function SectionHead({
  kicker,
  title,
  desc,
}: {
  kicker: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="px-1 text-center">
      <div className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ios-blue">
        {kicker}
      </div>
      <h2 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-tight text-balance md:text-[32px]">
        {title}
      </h2>
      {desc && (
        <p className="mx-auto mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground text-pretty">
          {desc}
        </p>
      )}
    </div>
  );
}
