import { Check, X, Sparkles, Target, ChevronRight, Flame } from "lucide-react";

/**
 * Static product mocks used on the landing page. These render non-interactive
 * facsimiles of the real UI so visitors understand features visually,
 * without needing to sign in first.
 */

// ── 1. WhyAttractive signature mock ──────────────────────────────────────

export function WhyAttractiveMock() {
  return (
    <div className="relative mx-auto w-full max-w-md space-y-3">
      <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-ios-orange/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-44 w-44 rounded-full bg-ios-blue/25 blur-3xl" />

      {/* Question preview */}
      <div className="surface-card relative rotate-[-1.2deg] p-4">
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
          マルウェアの一種である <span className="font-semibold">ワーム</span>
          の特徴として、適切なものはどれか。
        </div>
      </div>

      {/* Selected wrong choice */}
      <div className="surface-card relative flex items-center gap-3 rotate-[0.6deg] bg-gradient-to-br from-ios-red/6 via-card to-card p-3.5 ring-ios-red/30">
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

      {/* WhyAttractive card — signature moment */}
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
              ウイルスの定義『寄生』が頭にあり、ワームもマルウェアなので同じだと思いがち。実は自己増殖
              <strong className="font-semibold">だけ</strong>
              がワームの定義。
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
  );
}

// ── 2. Heatmap mock ──────────────────────────────────────────────────────

const HEATMAP_ROWS: { title: string; rate: number; attempted: number; correct: number }[] = [
  { title: "マルウェア種別の混同", rate: 0.72, attempted: 14, correct: 4 },
  { title: "暗号方式の方向混同", rate: 0.58, attempted: 12, correct: 5 },
  { title: "OSI層と機器の対応", rate: 0.41, attempted: 17, correct: 10 },
  { title: "PM/ITSM 用語の境界", rate: 0.28, attempted: 11, correct: 8 },
  { title: "正規化の段階混同", rate: 0.12, attempted: 8, correct: 7 },
];

export function HeatmapMock() {
  return (
    <div className="surface-card relative mx-auto w-full max-w-md overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ios-red/15 blur-2xl" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            誤解パターン別ヒートマップ
          </div>
          <div className="mt-0.5 text-[17px] font-semibold tracking-tight">
            どこで、なぜ、崩れるか
          </div>
        </div>
        <span className="num rounded-full bg-ios-red/10 px-2 py-0.5 text-[11px] font-semibold text-ios-red">
          弱点 5件
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {HEATMAP_ROWS.map((r) => {
          const pct = Math.round(r.rate * 100);
          const tone =
            r.rate >= 0.6
              ? { text: "text-ios-red", bar: "bg-gradient-to-r from-[#FF6B4A] to-[#FF3B30]" }
              : r.rate >= 0.4
              ? { text: "text-ios-orange", bar: "bg-gradient-to-r from-[#FFB23A] to-[#FF9500]" }
              : r.rate >= 0.2
              ? { text: "text-ios-yellow", bar: "bg-gradient-to-r from-[#FFD94A] to-[#FFCC00]" }
              : { text: "text-ios-green", bar: "bg-gradient-to-r from-[#30D158] to-[#00C7BE]" };
          return (
            <div key={r.title} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium">{r.title}</span>
                <span className={`num text-[11.5px] font-semibold ${tone.text}`}>
                  {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${tone.bar}`}
                  style={{ width: `${Math.max(pct, 6)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 3. Roadmap constellation mock ────────────────────────────────────────

const ROADMAP_NODES: { title: string; level: 0 | 1 | 2 | 3 }[] = [
  { title: "OSI参照モデル", level: 3 },
  { title: "共通鍵暗号", level: 3 },
  { title: "公開鍵暗号と署名", level: 2 },
  { title: "マルウェア種別", level: 1 },
  { title: "認証 vs 認可", level: 1 },
  { title: "ACID特性", level: 0 },
];

export function RoadmapMock() {
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-grad-ocean text-white shadow-hero">
      {/* Ambient */}
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
      <Stars />

      {/* Header */}
      <div className="relative z-10 flex items-start gap-3 p-5">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-75">
            Your Roadmap
          </div>
          <div className="mt-0.5 text-[17px] font-semibold tracking-tight">
            学びの星座
          </div>
        </div>
        <div className="text-right">
          <div className="num text-[22px] font-semibold leading-none tracking-tight">
            58
            <span className="ml-0.5 text-[11px] font-medium opacity-75">%</span>
          </div>
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] opacity-75">
            習熟度
          </div>
        </div>
      </div>

      {/* Path with nodes */}
      <div className="relative z-10 px-4 pb-5">
        {/* Spine */}
        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2">
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/15 to-transparent" />
          <div
            className="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-[#7BE0FF] to-[#B9FBE0]"
            style={{ height: "52%", boxShadow: "0 0 16px rgba(123,224,255,0.6)" }}
          />
        </div>

        <div className="relative space-y-3">
          {ROADMAP_NODES.map((n, i) => {
            const side: "left" | "right" = i % 2 === 0 ? "left" : "right";
            return (
              <div
                key={n.title}
                className="grid min-h-[52px] grid-cols-[1fr_40px_1fr] items-center"
              >
                {/* Left label */}
                <div
                  className={`pr-2 text-right ${
                    side === "left" ? "" : "pointer-events-none opacity-0"
                  }`}
                >
                  <div
                    className={`text-[13px] font-semibold leading-tight ${
                      n.level === 0 ? "opacity-60" : ""
                    }`}
                  >
                    {n.title}
                  </div>
                </div>

                {/* Node */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={`absolute top-1/2 h-[2px] w-3 -translate-y-1/2 rounded-full bg-white/30 ${
                      side === "left" ? "right-[24px]" : "left-[24px]"
                    }`}
                  />
                  <NodeMock level={n.level} />
                </div>

                {/* Right label */}
                <div
                  className={`pl-2 text-left ${
                    side === "right" ? "" : "pointer-events-none opacity-0"
                  }`}
                >
                  <div
                    className={`text-[13px] font-semibold leading-tight ${
                      n.level === 0 ? "opacity-60" : ""
                    }`}
                  >
                    {n.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NodeMock({ level }: { level: 0 | 1 | 2 | 3 }) {
  const size = level === 3 ? 26 : level === 2 ? 24 : level === 1 ? 22 : 18;
  const cfg = {
    0: { ring: "ring-white/35", bg: "bg-white/10", glow: "" },
    1: { ring: "ring-[#FF9F0A]/80", bg: "bg-[#FF9500]", glow: "bg-[#FF9500]/30" },
    2: { ring: "ring-[#64D2FF]/90", bg: "bg-[#0A84FF]", glow: "bg-[#0A84FF]/30" },
    3: { ring: "ring-[#B9FBC0]", bg: "bg-[#30D158]", glow: "bg-[#30D158]/30" },
  }[level];
  return (
    <span
      className="relative flex items-center justify-center"
      style={{ width: size + 4, height: size + 4 }}
    >
      {level >= 1 && (
        <span className={`absolute inset-[-6px] rounded-full ${cfg.glow} blur-md`} />
      )}
      <span
        className={`relative flex items-center justify-center rounded-full ring-2 ${cfg.ring} ${cfg.bg}`}
        style={{ width: size, height: size }}
      >
        {level === 3 && <Check className="h-3 w-3 text-white" strokeWidth={3.4} />}
        {level === 2 && (
          <span className="flex gap-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/95" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/95" />
          </span>
        )}
        {level === 1 && (
          <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
        )}
      </span>
    </span>
  );
}

function Stars() {
  const stars = Array.from({ length: 14 }).map((_, i) => {
    const x = (Math.sin(i * 91.17) + 1) / 2;
    const y = (Math.cos(i * 53.3) + 1) / 2;
    const o = 0.25 + ((i * 37) % 50) / 100;
    const s = 1 + ((i * 17) % 3);
    return { x, y, o, s };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${st.x * 100}%`,
            top: `${st.y * 100}%`,
            width: st.s,
            height: st.s,
            opacity: st.o * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// ── 4. Stats ring mock ──────────────────────────────────────────────────

export function StatsRingMock() {
  const accuracy = 72;
  const ringSize = 120;
  const stroke = 10;
  const r = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (accuracy / 100) * circ;

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-grad-ink p-6 text-white shadow-hero">
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-14 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />

      <div className="relative z-10 flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            <defs>
              <linearGradient id="lp-ring" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#30D158" />
                <stop offset="100%" stopColor="#00C7BE" />
              </linearGradient>
            </defs>
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={stroke}
              fill="none"
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              stroke="url(#lp-ring)"
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="num text-[26px] font-semibold leading-none">
              {accuracy}
              <span className="ml-0.5 text-[12px] font-medium opacity-70">%</span>
            </div>
            <div className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] opacity-70">
              正答率
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
              累計回答
            </div>
            <div className="num mt-0.5 text-[22px] font-semibold tracking-tight">
              182
              <span className="ml-1 text-[11px] font-medium opacity-70">問</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
              最大の敵
            </div>
            <div className="mt-0.5 truncate text-[13.5px] font-semibold">
              マルウェア種別の混同 (72%)
            </div>
          </div>
        </div>
      </div>

      {/* Sparkline hint */}
      <div className="relative z-10 mt-5 h-16">
        <svg viewBox="0 0 400 64" className="h-full w-full">
          <defs>
            <linearGradient id="lp-spark" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lp-line" x1="0" x2="1">
              <stop offset="0%" stopColor="#5E5CE6" />
              <stop offset="100%" stopColor="#0A84FF" />
            </linearGradient>
          </defs>
          <path
            d="M 0 40 C 40 35, 60 28, 100 30 S 160 18, 200 22 S 280 12, 320 16 S 380 8, 400 10 L 400 64 L 0 64 Z"
            fill="url(#lp-spark)"
          />
          <path
            d="M 0 40 C 40 35, 60 28, 100 30 S 160 18, 200 22 S 280 12, 320 16 S 380 8, 400 10"
            stroke="url(#lp-line)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {[
            [0, 40], [100, 30], [200, 22], [320, 16], [400, 10],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="white" />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ── 5. Session CTA tiles (Apple Music-style) ─────────────────────────────

export function SessionTilesMock() {
  return (
    <div className="mx-auto grid w-full max-w-md gap-3">
      <div className="hero-tile bg-grad-sunset !p-4">
        <div className="relative z-10 flex items-center gap-3.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
            <Target className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] opacity-80">
              今日のおすすめ
            </div>
            <div className="mt-0.5 text-[17px] font-semibold leading-tight tracking-tight">
              弱点5問チャレンジ
            </div>
            <div className="mt-0.5 text-[12px] opacity-85">
              誤解パターン重み付き
            </div>
          </div>
          <ChevronRight className="h-5 w-5 opacity-80" />
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2">
        <div className="hero-tile bg-grad-ocean !p-4">
          <div className="relative z-10">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
              <Flame className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div className="mt-3 text-[15px] font-semibold tracking-tight">
              ランダム1問
            </div>
            <div className="text-[11.5px] opacity-85">全範囲から</div>
          </div>
        </div>
        <div className="hero-tile bg-grad-ink !p-4">
          <div className="relative z-10">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
              <Sparkles className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div className="mt-3 text-[15px] font-semibold tracking-tight">
              模擬試験
            </div>
            <div className="text-[11.5px] opacity-85">100問 / 120分</div>
          </div>
        </div>
      </div>
    </div>
  );
}
