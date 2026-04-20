import Link from "next/link";
import {
  Check,
  ChevronRight,
  Clock,
  Layers,
  MinusCircle,
  TrendingUp,
  X,
} from "lucide-react";
import { getOrCreateAnonUser } from "@/lib/anonId";
import {
  getDailyStats,
  getRecentHistory,
  type HistoryRow,
} from "@/server/queries/history";
import { AccuracyRing } from "@/components/home/AccuracyRing";
import { ActivityWeek } from "@/components/home/ActivityWeek";

export const dynamic = "force-dynamic";
export const metadata = { title: "学習履歴" };

const MAJOR_HUE: Record<string, string> = {
  strategy: "#FF375F",
  management: "#FF9500",
  technology: "#0A84FF",
};

export default async function HistoryPage() {
  const user = await getOrCreateAnonUser();
  const [rows, daily] = await Promise.all([
    getRecentHistory(user.id, 100),
    getDailyStats(user.id, 7),
  ]);

  const answered = rows.filter((r) => r.result !== "skipped");
  const total = answered.length;
  const correct = rows.filter((r) => r.result === "correct").length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;
  const avgMs =
    answered.length > 0
      ? Math.round(
          answered.reduce((s, r) => s + r.durationMs, 0) / answered.length
        )
      : 0;

  // Group by JST date for editorial timeline
  const byDate = new Map<string, HistoryRow[]>();
  for (const r of rows) {
    const d = new Date(r.createdAt);
    const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const key = jst.toISOString().slice(0, 10);
    (byDate.get(key) ?? byDate.set(key, []).get(key)!)?.push(r);
  }
  const dateKeys = [...byDate.keys()].sort().reverse();

  return (
    <div className="space-y-7 pb-10">
      {/* ── Editorial header ── */}
      <header className="space-y-1.5 pt-1">
        <div className="kicker">History</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          学習履歴
        </h1>
        <p className="text-[13.5px] text-muted-foreground">
          直近100問の解答記録をタイムラインで。
        </p>
      </header>

      {/* ── Hero stats: ring + activity bar ── */}
      <section className="editorial-card p-5 sm:p-6">
        <div className="relative z-10 grid gap-5 sm:grid-cols-[auto_1px_1fr]">
          <div className="flex items-center gap-4">
            <AccuracyRing
              percent={accuracy}
              size={96}
              thickness={8}
              label="ACCURACY"
            />
            <div className="space-y-2">
              <StatLine
                label="解答"
                value={total}
                unit="問"
                accent="text-foreground"
              />
              <StatLine
                label="正解"
                value={correct}
                unit="問"
                accent="text-ios-green"
              />
              <StatLine
                label="平均"
                value={avgMs > 0 ? +(avgMs / 1000).toFixed(1) : 0}
                unit="秒"
                accent="text-ios-blue"
              />
            </div>
          </div>
          <div aria-hidden className="hidden h-full w-px bg-border sm:block" />
          <div className="min-h-[140px]">
            <ActivityWeek data={daily} />
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      {rows.length === 0 ? (
        <div className="surface-card flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div className="text-[15px] font-medium">
            まだ解答記録がありません
          </div>
          <Link
            href="/learn/session/new?mode=weakness&count=5"
            className="inline-flex h-10 items-center gap-1 rounded-full bg-foreground px-4 text-[13.5px] font-semibold text-background active:opacity-90"
          >
            5問セッションを始める
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="rule-label">Timeline</div>
          {dateKeys.map((key) => {
            const list = byDate.get(key) ?? [];
            const day = formatJstDateJp(key);
            const dayCorrect = list.filter((r) => r.result === "correct").length;
            const dayAnswered = list.filter((r) => r.result !== "skipped")
              .length;
            const dayRate =
              dayAnswered > 0
                ? Math.round((dayCorrect / dayAnswered) * 100)
                : null;
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-baseline justify-between px-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[14px] font-semibold tracking-tight">
                      {day}
                    </span>
                    <span className="num text-[11px] text-muted-foreground">
                      {list.length}件
                    </span>
                  </div>
                  {dayRate !== null && (
                    <span
                      className={`num text-[11.5px] font-semibold ${
                        dayRate >= 70
                          ? "text-ios-green"
                          : dayRate >= 50
                          ? "text-ios-orange"
                          : "text-ios-red"
                      }`}
                    >
                      {dayRate}%
                    </span>
                  )}
                </div>
                <div className="surface-card divide-y divide-border overflow-hidden">
                  {list.map((r) => (
                    <AttemptRow key={r.attemptId} r={r} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function AttemptRow({ r }: { r: HistoryRow }) {
  const dt = new Date(r.createdAt);
  const hue = MAJOR_HUE[r.majorCategory] ?? "#8E8E93";
  const time = new Date(dt.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(11, 16);
  return (
    <Link
      href={`/learn/questions/${r.questionId}`}
      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          r.result === "correct"
            ? "bg-ios-green/12 text-ios-green"
            : r.result === "incorrect"
            ? "bg-ios-red/12 text-ios-red"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {r.result === "correct" ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : r.result === "incorrect" ? (
          <X className="h-4 w-4" strokeWidth={3} />
        ) : (
          <MinusCircle className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
            style={{
              background: `${hue}1f`,
              color: hue,
            }}
          >
            <Layers className="h-2.5 w-2.5" />
            R{r.examYear} 問{r.questionNumber}
          </span>
          <span className="ml-auto inline-flex items-center gap-0.5 num">
            <Clock className="h-3 w-3" />
            {(r.durationMs / 1000).toFixed(1)}s
          </span>
          <span className="num">{time}</span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[13.5px]">{r.stem}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function StatLine({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  accent: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-10 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`num text-[15px] font-semibold tracking-tight ${accent}`}
      >
        {value}
        <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
          {unit}
        </span>
      </span>
    </div>
  );
}

function formatJstDateJp(ymd: string): string {
  const d = new Date(ymd + "T00:00:00Z");
  const dow = ["日", "月", "火", "水", "木", "金", "土"][d.getUTCDay()];
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const today = nowJst.toISOString().slice(0, 10);
  const yesterday = new Date(nowJst.getTime() - 86_400_000)
    .toISOString()
    .slice(0, 10);
  if (ymd === today) return "今日";
  if (ymd === yesterday) return "昨日";
  return `${m}月${day}日 (${dow})`;
}
