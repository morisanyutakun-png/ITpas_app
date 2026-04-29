import Link from "next/link";
import {
  Archive,
  BookOpen,
  ChevronRight,
  Shuffle,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import { hasFeature } from "@/lib/plan";
import { listPastExams } from "@/server/queries/pastExams";

export const dynamic = "force-dynamic";
export const metadata = { title: "問題を解く" };

/**
 * 「問題を解く」ハブ — 3 つの演習モードと過去問アーカイブ。読み物に
 * 戻る導線も最後に置き、学習サイクル (読む → 解く → 読む) を支える。
 */
export default async function LearnHubPage() {
  const user = await readCurrentUser();
  const canMock = hasFeature(user, "mockExam");
  const pastExams = await listPastExams();

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2 pt-1">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
          問題を解く
        </h1>
        <p className="max-w-[52ch] text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
          記事を読み終えたら、ここで知識を試しましょう。
          3 つの演習モードと、IPA 公式の過去問アーカイブを用意しています。
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <ModeCard
          href="/learn/random"
          grad="bg-grad-purple"
          icon={Shuffle}
          kicker="ランダム"
          title="気分転換に1問"
          sub="全範囲から抽選"
        />
        <ModeCard
          href="/learn/session/new?mode=weakness&count=5"
          grad="bg-grad-sunset"
          icon={Target}
          kicker="弱点補強"
          title="弱点を5問で詰める"
          sub="誤解パターンで重み付け"
        />
        <ModeCard
          href={canMock ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
          grad="bg-grad-ocean"
          icon={Timer}
          kicker={canMock ? "模擬試験" : "Pro"}
          title="本番形式で力試し"
          sub={canMock ? "100問 / 120分" : "Pro で開放"}
          lockedLabel={canMock ? undefined : "Pro"}
        />
      </section>

      <Link
        href="/learn/past-exams"
        className="surface-card flex items-center gap-4 p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-ink text-white shadow-tile">
          <Archive className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold tracking-tight">
            過去問アーカイブ
          </div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">
            IPA 公開 {pastExams.length} 回分の原典
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      <Link
        href="/learn/study"
        className="surface-card flex items-center gap-4 p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-blue text-white shadow-tile">
          <BookOpen className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold tracking-tight">
            学ぶに戻る
          </div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">
            読んでから解くと、もう一段定着します
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}

function ModeCard({
  href,
  grad,
  icon: Icon,
  kicker,
  title,
  sub,
  lockedLabel,
}: {
  href: string;
  grad: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  sub: string;
  lockedLabel?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-3xl ${grad} p-4 text-white shadow-hero transition-transform active:scale-[0.97]`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.22), transparent 55%), radial-gradient(100% 80% at 0% 100%, rgba(0,0,0,0.20), transparent 50%)",
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-semibold backdrop-blur">
          {lockedLabel ?? kicker}
        </span>
      </div>
      <div className="relative z-10">
        <div className="text-[16px] font-semibold leading-tight tracking-tight">
          {title}
        </div>
        <div className="text-[11.5px] opacity-85">{sub}</div>
      </div>
    </Link>
  );
}
