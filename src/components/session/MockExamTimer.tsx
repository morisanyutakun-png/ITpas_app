"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * iOS-style countdown bar rendered above a mock-exam session.
 *
 * Truth source is `startedAt` on the server; we recompute remaining
 * seconds on the client each tick. When time is up we redirect to the
 * result page so the user cannot continue past the deadline.
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
      className="sticky top-12 z-20 mb-3 overflow-hidden rounded-2xl bg-card shadow-ios-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            模擬試験 残り時間
          </div>
          <div
            className={`text-[22px] font-semibold tabular-nums tracking-tight ${
              criticalLow ? "text-ios-red" : "text-foreground"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
      </div>
      <div className="h-0.5 w-full bg-muted">
        <div
          className={`h-full transition-all ${
            criticalLow ? "bg-ios-red" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
