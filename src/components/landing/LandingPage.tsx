import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Crosshair,
  Flame,
  Lightbulb,
  Route,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import {
  HeatmapMock,
  RoadmapMock,
  SessionTilesMock,
  StatsRingMock,
  WhyAttractiveMock,
} from "./mocks";

/**
 * Marketing landing page for signed-out visitors.
 *
 * Flow: hero → pain vs promise → signature feature (WhyAttractive) →
 * feature-by-feature visual tours → product stats → pricing → final CTA.
 *
 * Every feature is introduced with a VISUAL mock (static facsimile of
 * the real UI) rather than prose alone — so users understand the app
 * before signing in.
 */
export function LandingPage() {
  return (
    <div className="space-y-20 pb-6 md:space-y-28">
      <HeroSection />
      <WhySection />
      <FeatureWhyAttractive />
      <FeatureHeatmap />
      <FeatureRoadmap />
      <FeatureStats />
      <FeatureSessions />
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
      <div className="pointer-events-none absolute inset-x-0 -top-12 -z-10 h-[560px] overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[520px] w-[960px] -translate-x-1/2 rounded-full bg-grad-sunset opacity-20 blur-3xl" />
        <div className="absolute left-[10%] top-24 h-[260px] w-[260px] rounded-full bg-ios-purple/30 blur-3xl" />
        <div className="absolute right-[8%] top-16 h-[220px] w-[220px] rounded-full bg-ios-blue/30 blur-3xl" />
      </div>

      <div className="grid items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-14">
        <div className="relative z-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-black/[0.04] backdrop-blur dark:ring-white/[0.08]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            ITパスポート 理解ノート
          </div>
          <h1 className="mt-4 text-[40px] font-semibold leading-[1.05] tracking-tight text-balance sm:text-[54px]">
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
            丸暗記では太刀打ちできない『ひっかけ』を、誤解パターンの正体から崩します。
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/api/auth/google/login?returnTo=/home"
              className="pill-primary h-12 gap-2 px-5 text-[15px] shadow-tint-blue"
            >
              Googleで始める
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="pill-ghost h-12 gap-1.5 px-5 text-[14px]">
              機能を見る
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

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <WhyAttractiveMock />
        </div>
      </div>
    </section>
  );
}

// ── Why (pain → promise) ─────────────────────────────────────────────────

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

// ── Feature showcase shared layout ───────────────────────────────────────

function FeatureRow({
  index,
  reverse,
  accent,
  kicker,
  title,
  desc,
  bullets,
  mock,
}: {
  index: string;
  reverse?: boolean;
  accent: string; // Tailwind text color class
  kicker: string;
  title: React.ReactNode;
  desc: string;
  bullets: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string }[];
  mock: React.ReactNode;
}) {
  return (
    <section id="features" className="relative scroll-mt-20">
      <div
        className={`grid items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-14 ${
          reverse ? "md:[&>:first-child]:order-2" : ""
        }`}
      >
        <div>
          <div className={`flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] ${accent}`}>
            <span className="num rounded-full bg-current/10 px-2 py-0.5 text-current">
              {index}
            </span>
            {kicker}
          </div>
          <h2 className="mt-3 text-[30px] font-semibold leading-tight tracking-tight text-balance md:text-[36px]">
            {title}
          </h2>
          <p className="mt-3 text-[15px] leading-[1.75] text-muted-foreground text-pretty">
            {desc}
          </p>
          <ul className="mt-5 space-y-2.5">
            {bullets.map((b) => (
              <li key={b.label} className="flex items-start gap-2.5 text-[14px]">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-current/10 ${accent}`}
                >
                  <b.icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
                <span className="text-foreground">{b.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>{mock}</div>
      </div>
    </section>
  );
}

// ── Feature 1: Why-attractive ───────────────────────────────────────────

function FeatureWhyAttractive() {
  return (
    <FeatureRow
      index="01"
      accent="text-ios-orange"
      kicker="Signature"
      title={
        <>
          誤答ごとに、
          <span className="bg-grad-sunset bg-clip-text text-transparent">
            『魅力理由』
          </span>
          。
        </>
      }
      desc="ITパスの4択は、3つがわざと似た響きで作られています。すべての誤答に『なぜ魅力的に見えたか』を明記することで、ひっかかった『引き寄せ』の形を言語化します。"
      bullets={[
        { icon: Lightbulb, label: "似た用語の混同・定義のズレ・反対方向の選択肢に名前がつく" },
        { icon: Target, label: "ひっかかった誤解パターンに自動で紐付く" },
        { icon: Route, label: "関連論点や比較表へ1タップで深掘り" },
      ]}
      mock={<WhyAttractiveMock />}
    />
  );
}

// ── Feature 2: Heatmap ──────────────────────────────────────────────────

function FeatureHeatmap() {
  return (
    <FeatureRow
      index="02"
      reverse
      accent="text-ios-red"
      kicker="Weakness"
      title={
        <>
          <span className="bg-grad-sunset bg-clip-text text-transparent">
            『型』
          </span>
          で積む、弱点分析。
        </>
      }
      desc="単元ではなく『どこでズレたか』で進捗を整理。赤く燃える誤解パターンから優先的に崩しにいけるので、学習時間が最短で結果につながります。"
      bullets={[
        { icon: BarChart3, label: "誤解パターン別の誤答率を一画面で可視化" },
        { icon: Crosshair, label: "ワンタップで『この弱点を5問で潰す』演習へ" },
        { icon: Flame, label: "敵の優先順位が自動で整う(緑→赤)" },
      ]}
      mock={<HeatmapMock />}
    />
  );
}

// ── Feature 3: Roadmap ──────────────────────────────────────────────────

function FeatureRoadmap() {
  return (
    <FeatureRow
      index="03"
      accent="text-ios-blue"
      kicker="Roadmap"
      title={
        <>
          学びを、
          <span className="bg-grad-ocean bg-clip-text text-transparent">
            星座
          </span>
          として可視化。
        </>
      }
      desc="3領域 × 論点ノードを点で結び、解くほどに経路が光ります。『未挑戦』『伸ばす』『定着』『習熟』の4段階で、頭のなかの地図がそのまま画面に現れる感覚。"
      bullets={[
        { icon: Route, label: "大分類→小分類→論点のツリー構造で全体像が明確" },
        { icon: Sparkles, label: "ノードは進捗レベルごとに色とグローで変化" },
        { icon: Target, label: "『次に解くべき一点』が光って案内される" },
      ]}
      mock={<RoadmapMock />}
    />
  );
}

// ── Feature 4: Stats dashboard ──────────────────────────────────────────

function FeatureStats() {
  return (
    <FeatureRow
      index="04"
      reverse
      accent="text-ios-green"
      kicker="Dashboard"
      title={
        <>
          伸びを、
          <span className="bg-grad-green bg-clip-text text-transparent">
            リング
          </span>
          で実感。
        </>
      }
      desc="累計正答率・直近14日の推移・最大の敵—本番までの距離を数字とグラフで把握。数値は『感情』まで含めて伝えます。"
      bullets={[
        { icon: BarChart3, label: "正答率リング + 累計・最大の敵を1画面で" },
        { icon: Sparkles, label: "直近14日の推移がスパークラインで一望" },
        { icon: Route, label: "『次に学ぶべき論点』を自動レコメンド" },
      ]}
      mock={<StatsRingMock />}
    />
  );
}

// ── Feature 5: Session CTAs ──────────────────────────────────────────────

function FeatureSessions() {
  return (
    <FeatureRow
      index="05"
      accent="text-ios-purple"
      kicker="Play"
      title={
        <>
          今日の一歩を、
          <span className="bg-grad-purple bg-clip-text text-transparent">
            ワンタップ
          </span>
          で。
        </>
      }
      desc="弱点5問・ランダム1問・模擬試験100問—目的別のセッションが常にホームから1タップ。迷ったらとりあえずシャッフル。"
      bullets={[
        { icon: Crosshair, label: "弱点5問：誤解パターン重み付きで自動抽出" },
        { icon: Flame, label: "ランダム1問：スキマ時間の高速学習" },
        { icon: Sparkles, label: "模擬試験：100問/120分の本番リハーサル" },
      ]}
      mock={<SessionTilesMock />}
    />
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
    <section className="space-y-6">
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
                <div className="text-[20px] font-semibold tracking-tight">{s.title}</div>
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

// ── Scope / stats ────────────────────────────────────────────────────────

function ScopeSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-grad-ink p-8 text-white shadow-hero md:p-14">
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-ios-blue/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-ios-purple/25 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
          Scope
        </div>
        <h2 className="mt-2 text-[30px] font-semibold leading-tight tracking-tight md:text-[40px]">
          ITパスポートの3領域を、
          <br className="hidden sm:inline" />
          誤解の形で地図化。
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed opacity-80">
          ストラテジ・マネジメント・テクノロジの全論点を、ひっかけが起きやすい境界線で整理。
        </p>
      </div>

      <div className="relative z-10 mt-10 grid grid-cols-3 gap-4">
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
      <div className="num text-[28px] font-semibold leading-none tracking-tight md:text-[38px]">
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
      cta: { href: "/api/auth/google/login?returnTo=/home", label: "無料で始める" },
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
    <section className="space-y-6">
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
        <h2 className="mt-2 text-[32px] font-semibold leading-tight tracking-tight text-balance md:text-[42px]">
          最初の5問で、
          <br className="hidden sm:inline" />
          学びの感触が変わります。
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed opacity-90 text-pretty">
          Googleでログインするだけで、進捗の記録と弱点レコメンドが始まります。
          クレカは不要です。
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/api/auth/google/login?returnTo=/home"
            className="pill h-12 gap-2 bg-foreground px-5 text-[15px] text-background shadow-ios"
          >
            Googleで始める
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="pill h-12 gap-1.5 bg-white/15 px-5 text-[14px] text-white ring-1 ring-inset ring-white/30 backdrop-blur"
          >
            料金プランを見る
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
