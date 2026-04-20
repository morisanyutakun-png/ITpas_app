import Link from "next/link";
import {
  Archive,
  ChevronRight,
  Crosshair,
  ListChecks,
  Network,
  Shuffle,
  Skull,
  Timer,
  type LucideIcon,
} from "lucide-react";

export default function LearnHubPage() {
  return (
    <div className="space-y-7">
      <header className="pt-1">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Library
        </div>
        <h1 className="mt-1.5 text-ios-large font-semibold">学習</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          どこから攻める？目的に合わせて選べます。
        </p>
      </header>

      {/* Featured — full-bleed gradient tiles */}
      <section className="grid gap-3 sm:grid-cols-3">
        <FeaturedTile
          href="/learn/session/new?mode=weakness&count=5"
          gradient="bg-grad-sunset"
          icon={Crosshair}
          kicker="Sharpen"
          title="弱点5問"
          desc="誤解パターン重み付き"
          large
        />
        <FeaturedTile
          href="/learn/random"
          gradient="bg-grad-purple"
          icon={Shuffle}
          kicker="Shuffle"
          title="ランダム1問"
          desc="全範囲から1問"
        />
        <FeaturedTile
          href="/learn/mock-exam"
          gradient="bg-grad-ocean"
          icon={Timer}
          kicker="Rehearsal"
          title="模擬試験"
          desc="100問 / 120分"
        />
      </section>

      <section className="space-y-2">
        <div className="ios-section-label">絞り込んで探す</div>
        <div className="ios-list">
          <Row
            icon={ListChecks}
            tile="bg-grad-blue"
            title="問題集（目次）"
            desc="年度・分類で絞り込んだ一覧"
            href="/learn/questions"
          />
          <Row
            icon={Network}
            tile="bg-grad-green"
            title="論点マップ"
            desc="OSI / 暗号 / PM… ノードから関連問題へ"
            href="/topics"
          />
          <Row
            icon={Skull}
            tile="bg-grad-orange"
            title="誤解パターン辞典"
            desc="ひっかけの正体を予習"
            href="/misconceptions"
          />
          <Row
            icon={Archive}
            tile="bg-grad-ink"
            title="過去問アーカイブ"
            desc="IPA公開問題の収録状況と回別模試"
            href="/learn/past-exams"
          />
        </div>
      </section>
    </div>
  );
}

function FeaturedTile({
  href,
  gradient,
  icon: Icon,
  kicker,
  title,
  desc,
  large,
}: {
  href: string;
  gradient: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  desc: string;
  large?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`hero-tile ${gradient} ${large ? "sm:col-span-3" : ""}`}
    >
      <div className="relative z-10 flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
            {kicker}
          </div>
          <div className="mt-0.5 text-[19px] font-semibold leading-tight tracking-tight">
            {title}
          </div>
          <div className="mt-0.5 text-[12.5px] opacity-85">{desc}</div>
        </div>
        <ChevronRight className="h-5 w-5 opacity-75" />
      </div>
    </Link>
  );
}

function Row({
  icon: Icon,
  tile,
  title,
  desc,
  href,
}: {
  icon: LucideIcon;
  tile: string;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href} className="ios-row active:bg-muted/60">
      <span className={`tile-icon-sm ${tile}`}>
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[12.5px] text-muted-foreground">{desc}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
