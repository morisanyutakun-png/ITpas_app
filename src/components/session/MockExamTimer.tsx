"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlarmClock, Clock } from "lucide-react";

/**
 * Countdown timer rendered above a mock-exam session.
 *
 * The source of truth is `startedAt` on the server row — we compute
 * remaining seconds on the client each tick. When the timer hits zero we
 * push the user to the result page so they cannot keep answering beyond
 * the deadline.
 */
export function MockExamTimer({
  sessionId,
  startedAtIso,
  durationMin,
}: {
  sessionId: string;
  startedAtIso: string;
  durationMin: number;
}) {
  const startedAtMs = useMemo(() => new Date(startedAtIso).getTime(), [startedAtIso]);
  const deadlineMs = startedAtMs + durationMin * 60_000;
  const [now, setNow] = useState<number>(() => Date.now());
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingMs = Math.max(0, deadlineMs - now);
  const totalMs = durationMin * 60_000;
  const pct = Math.min(100, Math.max(0, (remainingMs / totalMs) * 100));

  useEffect(() => {
    if (remainingMs === 0) {
      router.replace(`/learn/session/${sessionId}/result`);
    }
  }, [remainingMs, sessionId, router]);

  const minutes = Math.floor(remainingMs / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1000);
  const criticalLow = remainingMs <= 5 * 60_000;

  return (
    <div
      className={`sticky top-14 z-20 mb-3 overflow-hidden rounded-xl border-2 shadow-sm transition ${
        criticalLow
          ? "border-rose-400 bg-rose-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            criticalLow ? "bg-rose-500 text-white" : "bg-slate-900 text-white"
          }`}
        >
          {criticalLow ? <AlarmClock className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            模擬試験 残り時間
          </div>
          <div
            className={`text-xl font-black tracking-tight tabular-nums ${
              criticalLow ? "text-rose-700" : "text-slate-900"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-slate-100">
        <div
          className={`h-full transition-all ${
            criticalLow ? "bg-rose-500" : "bg-slate-900"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
