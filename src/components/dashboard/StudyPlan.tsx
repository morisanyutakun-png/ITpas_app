import Link from "next/link";
import { ArrowRight, Lock, Sparkles, Target, Timer } from "lucide-react";
import type { RecommendedTopic } from "@/server/queries/history";

export type StudyPlanProps = {
  totalAttempts: number;
  accuracy: number;
  coverage: number;
  topMisconception: {
    slug: string;
    title: string;
    incorrectRate: number;
    attempted: number;
  } | null;
  weakestTopic: RecommendedTopic | null;
  canMockExam: boolean;
};

type Status = "cold" | "needs-work" | "border" | "pass-zone";

type Ticket = {
  kicker: string;
  title: string;
  sub: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hue: string;
  primary?: boolean;
  locked?: boolean;
};

function diagnose(
  totalAttempts: number,
  accuracy: number,
  coverage: number
): {
  status: Status;
  label: string;
  body: string;
} {
  if (totalAttempts < 10) {
    return {
      status: "cold",
      label: "ウォームアップ",
      body: "10問解くと、傾向の分析が始まります。",
    };
  }
  if (accuracy >= 0.7 && coverage >= 0.5) {
    return {
      status: "pass-zone",
      label: "合格圏内",
      body: `総合正答率 ${Math.round(accuracy * 100)}% — このペースで仕上げにかかれます。`,
    };
  }
  if (accuracy >= 0.6) {
    return {
      status: "border",
      label: "ボーダー上",
      body: `あと ${Math.max(1, Math.round((0.7 - accuracy) * 100))}pt の上積みで安全圏。誤解の潰し込みが効きます。`,
    };
  }
  return {
    status: "needs-work",
    label: "重点強化",
    body: `総合正答率 ${Math.round(accuracy * 100)}% — まずは頻出の誤解パターンから。`,
  };
}

const STATUS_DOT: Record<Status, string> = {
  cold: "bg-ios-blue",
  "needs-work": "bg-ios-red",
  border: "bg-ios-orange",
  "pass-zone": "bg-ios-green",
};

function buildTickets(p: StudyPlanProps): Ticket[] {
  const out: Ticket[] = [];

  // 1) Cold start path → just keep solving.
  if (p.totalAttempts < 10) {
    out.push({
      kicker: "Start",
      title: "10問でリズムを作る",
      sub: "ランダム抽出 · 約10〜15分",
      href: "/learn/session/new?mode=weakness&count=10",
      icon: Sparkles,
      hue: "#0A84FF",
      primary: true,
    });
  }

  // 2) Deadly misconception — only when statistically meaningful.
  if (
    p.topMisconception &&
    p.topMisconception.attempted >= 2 &&
    p.topMisconception.incorrectRate >= 0.5
  ) {
    out.push({
      kicker: "Trap",
      title: `誤解「${p.topMisconception.title}」を潰す`,
      sub: `誤答率 ${Math.round(p.topMisconception.incorrectRate * 100)}% · 5問セッション`,
      href: `/learn/session/new?mode=weakness&misconception=${p.topMisconception.slug}&count=5`,
      icon: Target,
      hue: "#AF52DE",
      primary: out.length === 0,
    });
  }

  // 3) Topic-level reinforcement.
  if (p.weakestTopic && p.weakestTopic.reason === "弱点補強") {
    out.push({
      kicker: "Reinforce",
      title: `${p.weakestTopic.title} を補強`,
      sub: `これまでの正答率 ${Math.round(p.weakestTopic.correctRate * 100)}% · 5問セッション`,
      href: `/learn/session/new?mode=topic&topic=${p.weakestTopic.slug}&count=5`,
      icon: Target,
      hue: "#FF9500",
      primary: out.length === 0,
    });
  }

  // 4) Untouched topic — broaden coverage.
  if (p.weakestTopic && p.weakestTopic.reason === "未挑戦の論点") {
    out.push({
      kicker: "Discover",
      title: `${p.weakestTopic.title} を初挑戦`,
      sub: "未着手の論点を5問セッションで",
      href: `/learn/session/new?mode=topic&topic=${p.weakestTopic.slug}&count=5`,
      icon: Sparkles,
      hue: "#34C759",
      primary: out.length === 0,
    });
  }

  // 5) Mock exam — for those past 30 attempts and ready to rehearse.
  if (p.totalAttempts >= 30) {
    out.push({
      kicker: "Rehearse",
      title: "模擬試験で本番感覚",
      sub: "100問 · 120分。Pro限定",
      href: p.canMockExam ? "/learn/mock-exam" : "/pricing?reason=mock_exam",
      icon: Timer,
      hue: "#0A84FF",
      locked: !p.canMockExam,
    });
  }

  // 6) Baseline weakness 5問 — always available as a fallback.
  out.push({
    kicker: "Sharpen",
    title: "弱点5問チャレンジ",
    sub: "誤解パターン重み付きで自動抽出",
    href: "/learn/session/new?mode=weakness&count=5",
    icon: Target,
    hue: "#FF375F",
    primary: out.length === 0,
  });

  // Take first 3 distinct tickets (primary first).
  const sorted = [...out].sort((a, b) => Number(!!b.primary) - Number(!!a.primary));
  return sorted.slice(0, 3);
}

export function StudyPlan(props: StudyPlanProps) {
  const d = diagnose(props.totalAttempts, props.accuracy, props.coverage);
  const tickets = buildTickets(props);

  return (
    <section className="editorial-card relative overflow-hidden p-6 sm:p-7">
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="kicker">Study Plan</div>
            <h2 className="text-[24px] font-semibold leading-tight tracking-tight sm:text-[28px]">
              次の一手
            </h2>
            <p className="max-w-md text-[13.5px] text-muted-foreground text-pretty">
              {d.body}
            </p>
          </div>
          <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-card px-3 text-[12px] font-semibold shadow-ios-sm ring-1 ring-black/[0.05] dark:ring-white/[0.06]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[d.status]}`}
            />
            {d.label}
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3">
          {tickets.map((t, i) => (
            <TicketCard key={t.href + i} ticket={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const Icon = ticket.icon;
  return (
    <Link
      href={ticket.href}
      className={`group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl bg-card p-4 ring-1 ring-black/[0.05] shadow-ios-sm transition-transform active:scale-[0.99] dark:ring-white/[0.06] ${
        ticket.primary ? "sm:col-span-1 sm:row-span-1" : ""
      }`}
    >
      {ticket.primary && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-[0.10] blur-2xl"
          style={{ background: ticket.hue }}
        />
      )}
      <div className="relative flex items-start justify-between">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-tile"
          style={{ background: ticket.hue }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.4} />
        </span>
        {ticket.locked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Lock className="h-3 w-3" />
            Pro
          </span>
        )}
      </div>
      <div className="relative space-y-1">
        <div
          className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: ticket.hue }}
        >
          {ticket.kicker}
        </div>
        <div className="line-clamp-2 text-[14.5px] font-semibold leading-snug tracking-tight">
          {ticket.title}
        </div>
        <div className="text-[11.5px] text-muted-foreground">{ticket.sub}</div>
      </div>
      <div className="relative flex items-center justify-end text-[11.5px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
        始める
        <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
