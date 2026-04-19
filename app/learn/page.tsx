import Link from "next/link";
import { Crosshair, ListChecks, Network, Skull, ArrowRight, Shuffle, type LucideIcon } from "lucide-react";

export default function LearnHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">学習ハブ</h1>
        <p className="text-sm text-slate-600">どこから攻める？</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BigCard
          href="/learn/random"
          tone="from-amber-500 to-orange-500"
          icon={Shuffle}
          title="ランダムに1問"
          desc="迷ったらこれ。全範囲から1問だけ表示します。"
          cta="ランダム出題"
        />
        <BigCard
          href="/learn/session/new?mode=weakness&count=5"
          tone="from-rose-500 to-pink-500"
          icon={Crosshair}
          title="弱点5問チャレンジ"
          desc="あなたが落ちやすい誤解パターンに刺さる5問を自動抽出。"
          cta="今すぐ挑む"
        />
        <BigCard
          href="/learn/questions"
          tone="from-violet-500 to-fuchsia-500"
          icon={ListChecks}
          title="問題集（目次）"
          desc="年度・分類で絞り込んだ目次から好きな問題へ。"
          cta="一覧を開く"
        />
        <BigCard
          href="/topics"
          tone="from-emerald-500 to-teal-500"
          icon={Network}
          title="論点マップから攻める"
          desc="OSI、暗号、PM…論点ノードから関連問題に飛ぶ。"
          cta="マップを見る"
        />
        <BigCard
          href="/misconceptions"
          tone="from-amber-500 to-orange-500"
          icon={Skull}
          title="誤解パターン辞典"
          desc="ひっかけの正体を予習。同じ誤解で二度落ちない。"
          cta="敵キャラを見る"
        />
      </div>
    </div>
  );
}

function BigCard({
  href,
  tone,
  icon: Icon,
  title,
  desc,
  cta,
}: {
  href: string;
  tone: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 hover:shadow-lg">
        <div
          className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${tone} opacity-10 blur-2xl group-hover:opacity-25 transition`}
        />
        <div className="relative space-y-3">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md`}>
            <Icon className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-bold leading-snug">{title}</h3>
          <p className="text-sm text-slate-600">{desc}</p>
          <div className="flex items-center gap-1 text-sm font-bold text-slate-900 group-hover:translate-x-0.5 transition-transform">
            {cta}
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
