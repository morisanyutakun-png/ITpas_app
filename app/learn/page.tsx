import Link from "next/link";
import {
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
    <div className="space-y-6">
      <header className="pt-2">
        <h1 className="text-ios-title1 font-semibold">学習</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          どこから攻める？目的に合わせて選べます。
        </p>
      </header>

      <section className="space-y-2">
        <div className="ios-section-label">すぐに解く</div>
        <div className="ios-list shadow-ios-sm">
          <Row
            icon={Crosshair}
            tint="text-ios-red"
            title="弱点5問チャレンジ"
            desc="誤解パターン重み付きで自動抽出"
            href="/learn/session/new?mode=weakness&count=5"
          />
          <Row
            icon={Shuffle}
            tint="text-ios-purple"
            title="ランダムに1問"
            desc="迷ったらこれ。全範囲から1問"
            href="/learn/random"
          />
          <Row
            icon={Timer}
            tint="text-ios-blue"
            title="模擬試験"
            desc="本番形式 100問 / 120分"
            href="/learn/mock-exam"
          />
        </div>
      </section>

      <section className="space-y-2">
        <div className="ios-section-label">絞り込んで探す</div>
        <div className="ios-list shadow-ios-sm">
          <Row
            icon={ListChecks}
            tint="text-foreground"
            title="問題集（目次）"
            desc="年度・分類で絞り込んだ一覧"
            href="/learn/questions"
          />
          <Row
            icon={Network}
            tint="text-ios-teal"
            title="論点マップ"
            desc="OSI / 暗号 / PM… ノードから関連問題へ"
            href="/topics"
          />
          <Row
            icon={Skull}
            tint="text-ios-orange"
            title="誤解パターン辞典"
            desc="ひっかけの正体を予習"
            href="/misconceptions"
          />
        </div>
      </section>
    </div>
  );
}

function Row({
  icon: Icon,
  tint,
  title,
  desc,
  href,
}: {
  icon: LucideIcon;
  tint: string;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href} className="ios-row active:bg-muted/60">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon className={`h-4 w-4 ${tint}`} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium">{title}</div>
        <div className="text-[12px] text-muted-foreground">{desc}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
