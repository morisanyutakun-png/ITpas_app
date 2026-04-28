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
export const metadata = { title: "演習" };

/**
 * 演習ハブ — output triad + a single quiet pointer back to input. The page
 * intentionally has no recommendations or hero cards; that work belongs on
 * /home. Here we just want the four crisp doors: Random / Weakness / Mock
 * / Past papers, plus a "go back to input" affordance.
 */
export default async function LearnHubPage() {
  const user = await readCurrentUser();
  const canMock = hasFeature(user, "mockExam");
  const pastExams = await listPastExams();

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-1.5 pt-1">
        <div className="kicker">Output · Practice</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          演習
        </h1>
        <p className="max-w-xl text-[13.5px] text-muted-foreground text-pretty">
          解いて確かめる。3 つの入口とアーカイブ。
        </p>
      </header>

      {/* ── Output triad ── */}
      <section className="grid gap-3 sm:grid-cols-3">
        <ModeCard
          href="/learn/random"
          grad="bg-grad-purple"
          icon={Shuffle}
          kicker="Random"
          title="ランダム1問"
          sub="全範囲から1問だけ"
        />
        <ModeCard
          href="/learn/session/new?mode=weakness&count=5"
          grad="bg-grad-sunset"
          icon={Target}
          kicker="Weakness"
          title="弱点5問"
          sub="誤解パターンで重み付け"
        />
        <ModeCard
          href={canMock ? "/learn/mock-exam" : "/pricing?reason=mock_exam"}
          grad="bg-grad-ocean"
          icon={Timer}
          kicker="Mock Exam"
          title="模擬試験"
          sub="本番形式で力試し"
          lockedLabel={canMock ? undefined : "Pro"}
        />
      </section>

      {/* ── Past-exam archive — 1 quiet row ── */}
      <Link
        href="/learn/past-exams"
        className="surface-card flex items-center gap-4 p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-grad-ink text-white shadow-tile">
          <Archive className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Archive · IPA
          </div>
          <div className="text-[16px] font-semibold">過去問アーカイブ</div>
          <div className="text-[12px] text-muted-foreground">
            IPA 公開 {pastExams.length} 回分
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      {/* ── Cross-link to input ── */}
      <Link
        href="/learn/study"
        className="surface-card flex items-center gap-4 p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background shadow-tile">
          <BookOpen className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Input
          </div>
          <div className="text-[16px] font-semibold">学習モードで読む</div>
          <div className="text-[12px] text-muted-foreground">
            図解と要点で 60 秒インプット
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
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-85">
          {lockedLabel ?? kicker}
        </span>
      </div>
      <div className="relative z-10">
        <div className="text-[17px] font-semibold leading-tight tracking-tight">
          {title}
        </div>
        <div className="text-[11.5px] opacity-85">{sub}</div>
      </div>
    </Link>
  );
}
