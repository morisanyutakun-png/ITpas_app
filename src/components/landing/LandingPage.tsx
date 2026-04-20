import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Crosshair,
  Flame,
  Lightbulb,
  Route,
  Sparkles,
  Target,
  Timer,
  X,
} from "lucide-react";

/**
 * Marketing landing page shown to signed-out visitors.
 *
 * Sections follow a signal → proof → promise → pricing → CTA flow. Uses
 * the app's design tokens (hero-tile, surface-card, gradient palette) so
 * the LP feels like the first scene of the product rather than a
 * separate brochure.
 */
export function LandingPage() {
  return (
    <div className="space-y-16 pb-4 md:space-y-24">
      <HeroSection />
      <WhySection />
      <SignatureFeatureSection />
      <FeaturesGridSection />
      <HowItWorksSection />
      <ScopeSection />
      <PricingTeaserSection />
      <FinalCtaSection />
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-x-0 -top-12 -z-10 h-[520px] overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-grad-sunset opacity-20 blur-3xl" />
        <div className="absolute left-[10%] top-24 h-[260px] w-[260px] rounded-full bg-ios-purple/30 blur-3xl" />
        <div className="absolute right-[8%] top-16 h-[220px] w-[220px] rounded-full bg-ios-blue/30 blur-3xl" />
      </div>

      <div className="grid items-center gap-8 md:grid-cols-[1.05fr_1fr] md:gap-12">
        {/* Copy */}
        <div className="relative z-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-black/[0.04] backdrop-blur dark:ring-white/[0.08]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            ITパスポート 理解ノート
          </div>
          <h1 className="mt-4 text-[40px] font-semibold leading-[1.05] tracking-tight text-balance sm:text-[52px]">
            覚えない。
            <br />
            <span className="bg-grad-sunset bg-clip-text text-transparent">
              理解で解く。
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15.5px] leading-[1.75] text-muted-foreground text-pretty">
            すべての誤答選択肢に{" "}
            <span className="font-semibold text-foreground">
              「なぜ引き寄せられたか」
            </span>
            を書いた、理解特化型のITパスポート学習ノート。
            丸暗記では太刀打ちできない"ひっかけ"を、誤解パターンの正体から崩します。
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/api/auth/google/login?returnTo=/"
              className="pill-primary h-12 gap-2 px-5 text-[15px] shadow-tint-blue"
            >
              Googleで始める
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#signature"
              className="pill-ghost h-12 gap-1.5 px-5 text-[14px]"
            >
              仕組みを見る
            </a>
          </div>
          <div className="mt-5 flex items-center gap-4 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-ios-green" />
              無料でその日から10問
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-ios-green" />
              クレカ不要
            </span>
          </div>
        </div>

        {/* Visual mock */}
        <div className="relative animate-fade-up [animation-delay:120ms]">
          <HeroMock />
        </div>
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <div className="relative mx-auto max-w-md">
      {/* Floating glows */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-ios-orange/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-44 w-44 rounded-full bg-ios-blue/25 blur-3xl" />

      <div className="relative space-y-3">
        {/* Question preview */}
        <div className="surface-card rotate-[-1.2deg] p-4">
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold">
            <span className="rounded-full bg-foreground px-2 py-0.5 text-background">
              過去問
            </span>
            <span className="rounded-full bg-grad-green px-2 py-0.5 text-white">
              テクノロジ
            </span>
            <span className="num ml-auto text-muted-foreground">R6秋 問12</span>
          </div>
          <div className="mt-3 text-[14px] leading-relaxed text-foreground/90">
            マルウェアの一種である{" "}
            <span className="font-semibold">ワーム</span>の特徴として、
            適切なものはどれか。
          </div>
        </div>

        {/* Selected wrong choice */}
        <div className="surface-card flex items-center gap-3 rotate-[0.6deg] bg-gradient-to-br from-ios-red/6 via-card to-card p-3.5 ring-ios-red/30">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ios-red text-[13px] font-semibold text-white">
            イ
          </span>
          <span className="flex-1 text-[13.5px] leading-snug text-foreground/85">
            自己増殖せず、正常なファイルに寄生する
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ios-red text-white">
            <X className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        </div>

        {/* Why attractive — signature card */}
        <div className="relative overflow-hidden rounded-2xl p-4 shadow-hero ring-1 ring-ios-orange/20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#FFF2E0] via-[#FFE4C4] to-[#FFD9B3] dark:from-[#3b2a15] dark:via-[#2d1f10] dark:to-[#25180b]" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ios-orange/30 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-grad-sunset text-[15px] font-semibold text-white shadow-tint-orange">
              イ
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
                <Sparkles className="h-3 w-3" strokeWidth={2.4} />
                なぜこの選択肢が魅力的に見えたか
              </div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-foreground/90">
                ウイルスの定義 <em className="font-semibold">"寄生"</em>{" "}
                が頭にあり、ワームもマルウェアなので同じだと思いがち。実は自己増殖
                <em className="font-semibold">だけ</em>がワームの定義。
              </p>
            </div>
          </div>
          <div className="relative mt-3 flex items-center gap-2.5 rounded-xl bg-card/70 p-2.5 ring-1 ring-black/[0.04] backdrop-blur-sm dark:bg-background/40">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ios-orange text-white shadow-tint-orange">
              <Target className="h-3.5 w-3.5" strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                誤解パターン
              </div>
              <div className="truncate text-[13px] font-semibold">
                マルウェア種別の混同
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Why / Pain → Promise ─────────────────────────────────────────────────

function WhySection() {
  return (
    <section className="relative">
      <div className="grid gap-4 md:grid-cols-2">
        <WhyCard
          tone="bad"
          label="ありがちな学習"
          title="丸暗記で消耗する"
          body="過去問集を眺める → 正解の記号だけ覚える → 本番で少し言い換えられて崩れる。次にどこを直すべきかが見えない。"
          items={[
            "なぜ間違えたか言語化できない",
            "単元ごとに薄く広く、穴が特定できない",
            "本番で新しい設問に対応できない",
          ]}
        />
        <WhyCard
          tone="good"
          label="理解ノートのやり方"
          title="誤解の形を崩す"
          body="すべての誤答に『なぜ魅力的に見えたか』が書かれている。ひっかかった『引き寄せ』を言語化し、誤解パターン単位で潰す。"
          items={[
            "間違え方に名前がつき、再現性が出る",
            "弱点=誤解パターンで抽出できる",
            "言い換えられても『型』で見抜ける",
          ]}
        />
      </div>
    </section>
  );
}

function WhyCard({
  tone,
  label,
  title,
  body,
  items,
}: {
  tone: "bad" | "good";
  label: string;
  title: string;
  body: string;
  items: string[];
}) {
  const bad = tone === "bad";
  return (
    <div
      className={`surface-card relative overflow-hidden p-6 ${
        bad ? "" : "bg-gradient-to-br from-ios-green/8 via-card to-card ring-ios-green/20"
      }`}
    >
      {!bad && (
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ios-green/20 blur-3xl" />
      )}
      <div
        className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
          bad ? "text-muted-foreground" : "text-ios-green"
        }`}
      >
        {label}
      </div>
      <div className="mt-1.5 text-[22px] font-semibold leading-tight tracking-tight">
        {title}
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
        {body}
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2.5 text-[14px]">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                bad
                  ? "bg-muted text-muted-foreground"
                  : "bg-ios-green/15 text-ios-green"
              }`}
            >
              {bad ? (
                <X className="h-3 w-3" strokeWidth={3} />
              ) : (
                <Check className="h-3 w-3" strokeWidth={3} />
              )}
            </span>
            <span className={bad ? "text-muted-foreground" : "text-foreground"}>
              {it}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Signature feature ────────────────────────────────────────────────────

function SignatureFeatureSection() {
  return (
    <section id="signature" className="relative scroll-mt-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ios-orange">
            Signature
          </div>
          <h2 className="mt-2 text-[34px] font-semibold leading-tight tracking-tight text-balance">
            誤答ごとに、
            <span className="bg-grad-sunset bg-clip-text text-transparent">
              "魅力理由"
            </span>
            。
          </h2>
          <p className="mt-3 text-[15px] leading-[1.75] text-muted-foreground">
            ITパス問題の4択は、どれか3つがわざと似た響きで作られています。
            理解ノートは{" "}
            <span className="font-semibold text-foreground">
              すべての誤答に『なぜ魅力的に見えたか』
            </span>
            を書くことで、ひっかかった"引き寄せ"の形を言語化します。
          </p>

          <div className="mt-6 space-y-3">
            <FeatureBullet
              icon={Lightbulb}
              tile="bg-grad-sunset"
              title="『型』が見える"
              desc="似た用語の混同、定義のズレ、反対の選択肢—自分の『崩れ方』に名前がつく"
            />
            <FeatureBullet
              icon={Target}
              tile="bg-grad-orange"
              title="誤解パターンに紐づく"
              desc="同じ型の敗因を次回から検知できる。重み付きで弱点演習に自動抽出"
            />
            <FeatureBullet
              icon={BookOpen}
              tile="bg-grad-blue"
              title="資料・論点へ1タップ"
              desc="比較表・計算ルール・関連論点へ、問題から直接ジャンプ"
            />
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -left-10 -top-6 h-48 w-48 rounded-full bg-ios-orange/25 blur-3xl" />
          <SignatureMock />
        </div>
      </div>
    </section>
  );
}

function FeatureBullet({
  icon: Icon,
  tile,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tile: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className={`tile-icon-sm ${tile} mt-0.5`}>
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold tracking-tight">{title}</div>
        <div className="text-[13px] leading-relaxed text-muted-foreground text-pretty">
          {desc}
        </div>
      </div>
    </div>
  );
}

function SignatureMock() {
  return (
    <div className="relative mx-auto max-w-md space-y-3">
      <div className="surface-card p-4">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          不正解
        </div>
        <div className="mt-1 text-[14px] text-foreground/85">
          選択肢<span className="font-semibold">「ウ」</span>を選びました
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl p-5 shadow-hero ring-1 ring-ios-orange/20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#FFF2E0] via-[#FFE4C4] to-[#FFD9B3] dark:from-[#3b2a15] dark:via-[#2d1f10] dark:to-[#25180b]" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ios-orange/20 blur-2xl" />
        <div className="relative flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-grad-sunset text-[17px] font-semibold text-white shadow-tint-orange">
            ウ
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ios-orange">
              <Sparkles className="h-3 w-3" strokeWidth={2.4} />
              なぜ魅力的に見えたか
            </div>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-foreground">
              公開鍵暗号=RSA と刷り込まれていると、ハッシュ処理を公開鍵の"一種"と勘違いしがち。
              <strong className="font-semibold">署名は秘密鍵で作る</strong>
              、という方向が逆になっている。
            </p>
          </div>
        </div>
      </div>

      <div className="surface-card flex items-center gap-3 p-3.5">
        <span className="tile-icon-sm bg-grad-sunset">
          <Target className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            弱点の正体
          </div>
          <div className="truncate text-[13.5px] font-semibold">
            暗号方式の方向混同
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

// ── Features grid ────────────────────────────────────────────────────────

function FeaturesGridSection() {
  const features = [
    {
      tile: "bg-grad-sunset",
      icon: Sparkles,
      title: "魅力理由つきの解説",
      desc: "すべての誤答に『なぜ引き寄せられたか』を明記",
    },
    {
      tile: "bg-grad-blue",
      icon: BarChart3,
      title: "誤解パターン別ヒートマップ",
      desc: "単元ではなく、どこでズレたかで進捗を見る",
    },
    {
      tile: "bg-grad-purple",
      icon: Route,
      title: "学びの星座ロードマップ",
      desc: "論点ノードを点で結び、習熟するほど経路が光る",
    },
    {
      tile: "bg-grad-green",
      icon: Crosshair,
      title: "弱点重み付き演習",
      desc: "自分の誤解に刺さる5問を、ワンタップで",
    },
    {
      tile: "bg-grad-ocean",
      icon: Timer,
      title: "模擬試験",
      desc: "100問 / 120分の本番リハーサル",
    },
    {
      tile: "bg-grad-orange",
      icon: BookOpen,
      title: "関連資料へ1タップ",
      desc: "比較表・計算ルール・関連論点へ問題から直接",
    },
  ];
  return (
    <section className="space-y-5">
      <SectionHead
        kicker="Features"
        title="合格までの道具、ぜんぶ。"
        desc="理解特化の学習を支える機能群。派手なゲーミフィケーションは入れません。"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="surface-card p-5">
            <span className={`tile-icon ${f.tile}`}>
              <f.icon className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div className="mt-4 text-[17px] font-semibold tracking-tight">
              {f.title}
            </div>
            <div className="mt-1 text-[13px] leading-relaxed text-muted-foreground text-pretty">
              {f.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── How it works ─────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      title: "解く",
      desc: "過去問を1問。選んで、答え合わせ。",
      tile: "bg-grad-ocean",
    },
    {
      n: "02",
      title: "見抜く",
      desc: "誤答の『魅力理由』で、自分がひっかかった型を言語化。",
      tile: "bg-grad-sunset",
    },
    {
      n: "03",
      title: "潰す",
      desc: "誤解パターン別に重み付きで5問演習。弱点を積分で消す。",
      tile: "bg-grad-green",
    },
  ];
  return (
    <section className="space-y-5">
      <SectionHead
        kicker="How it works"
        title="3ステップで、理解が積み上がる。"
        desc="1問ごとに、丸暗記ではない学習サイクルが回ります。"
      />
      <div className="relative grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.n} className="surface-card relative overflow-hidden p-6">
            <div className="flex items-center gap-3">
              <span className={`tile-icon ${s.tile}`}>
                <span className="num text-[15px] font-semibold">{s.n}</span>
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
            {i < steps.length - 1 && (
              <ChevronRight className="pointer-events-none absolute right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground/50 md:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Scope / stats ────────────────────────────────────────────────────────

function ScopeSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-grad-ink p-8 text-white shadow-hero md:p-12">
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-ios-blue/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-ios-purple/25 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
          Scope
        </div>
        <h2 className="mt-2 text-[30px] font-semibold leading-tight tracking-tight md:text-[38px]">
          ITパスポートの3領域を、
          <br className="hidden sm:inline" />
          誤解の形ですべて地図化。
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed opacity-80">
          ストラテジ・マネジメント・テクノロジの全論点を、
          ひっかけが起きやすい境界線で整理しています。
        </p>
      </div>

      <div className="relative z-10 mt-8 grid grid-cols-3 gap-4 md:mt-10">
        <StatCell value="26+" label="学習論点" />
        <StatCell value="20+" label="誤解パターン" />
        <StatCell value="全選択肢" label="魅力理由つき" />
      </div>
    </section>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="num text-[28px] font-semibold leading-none tracking-tight md:text-[36px]">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-75">
        {label}
      </div>
    </div>
  );
}

// ── Pricing teaser ───────────────────────────────────────────────────────

function PricingTeaserSection() {
  const plans = [
    {
      tier: "Free",
      price: "¥0",
      priceNote: "いつまでも無料",
      tile: "bg-grad-mono",
      perks: ["1日10問まで", "ブックマーク 3件", "基本の解説と魅力理由"],
      cta: { href: "/api/auth/google/login?returnTo=/", label: "無料で始める" },
    },
    {
      tier: "Pro",
      price: "¥780",
      priceNote: "月額",
      tile: "bg-grad-blue",
      featured: true,
      perks: [
        "1日無制限",
        "誤解パターン別ヒートマップ",
        "模擬試験 (100問/120分)",
        "広告非表示",
      ],
      cta: { href: "/pricing", label: "Proの詳細" },
    },
    {
      tier: "Premium",
      price: "¥1,980",
      priceNote: "月額",
      tile: "bg-grad-purple",
      perks: [
        "全年度アーカイブ",
        "AI個別解説",
        "最大200問の模擬試験",
        "優先サポート",
      ],
      cta: { href: "/pricing", label: "Premiumの詳細" },
    },
  ];
  return (
    <section className="space-y-5">
      <SectionHead
        kicker="Pricing"
        title="まずは無料で、納得したらPro。"
        desc="Proは月額¥780。契約はいつでも停止できます。"
      />
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.tier}
            className={`relative overflow-hidden rounded-3xl p-6 ring-1 ${
              p.featured
                ? "bg-grad-ink text-white shadow-hero ring-white/10"
                : "surface-card"
            }`}
          >
            {p.featured && (
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
            )}
            <div className="relative z-10">
              <span className={`tile-icon ${p.tile} !h-9 !w-9`}>
                <Sparkles className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <div className="mt-4 text-[13px] font-semibold uppercase tracking-[0.14em] opacity-80">
                {p.tier}
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="num text-[30px] font-semibold tracking-tight">
                  {p.price}
                </span>
                <span className="text-[12px] opacity-75">{p.priceNote}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-[13.5px]">
                    <Check
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                        p.featured ? "text-ios-mint" : "text-ios-green"
                      }`}
                      strokeWidth={3}
                    />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                href={p.cta.href}
                className={`mt-6 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-transform active:scale-[0.98] ${
                  p.featured
                    ? "bg-white text-foreground shadow-ios"
                    : "bg-foreground text-background"
                }`}
              >
                {p.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="px-1 text-center text-[12px] text-muted-foreground">
        年額プランなら最大約30%オフ。詳細は{" "}
        <Link href="/pricing" className="font-semibold text-primary hover:underline">
          料金ページ
        </Link>{" "}
        を参照。
      </div>
    </section>
  );
}

// ── Final CTA ────────────────────────────────────────────────────────────

function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-grad-sunset p-8 text-white shadow-hero md:p-14">
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-85">
          Start today
        </div>
        <h2 className="mt-2 text-[32px] font-semibold leading-tight tracking-tight text-balance md:text-[40px]">
          最初の5問で、
          <br className="hidden sm:inline" />
          学びの感触が変わります。
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed opacity-90 text-pretty">
          Googleでログインするだけで、進捗の記録と弱点レコメンドが始まります。
          クレカは不要。匿名で試してから、気に入ったらログインしてもOK。
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/api/auth/google/login?returnTo=/"
            className="pill h-12 gap-2 bg-foreground px-5 text-[15px] text-background shadow-ios"
          >
            Googleで始める
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/learn/random"
            className="pill h-12 gap-1.5 bg-white/15 px-5 text-[14px] text-white ring-1 ring-inset ring-white/30 backdrop-blur"
          >
            ログインせず1問試す
            <Flame className="h-4 w-4" />
          </Link>
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
      <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {kicker}
      </div>
      <h2 className="mt-1.5 text-[28px] font-semibold leading-tight tracking-tight text-balance md:text-[34px]">
        {title}
      </h2>
      {desc && (
        <p className="mx-auto mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground text-pretty">
          {desc}
        </p>
      )}
    </div>
  );
}
