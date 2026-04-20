"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "lucide-react";

/**
 * Mock-exam countdown pinned above the session. Source of truth is
 * `startedAt` (server); we recompute each second on the client. When time
 * is up we redirect to the result page so the user cannot continue past
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
    <div className="sticky top-14 z-20 mb-3 overflow-hidden rounded-2xl bg-card ring-1 ring-black/[0.04] shadow-ios dark:ring-white/[0.06]">
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            criticalLow
              ? "bg-ios-red text-white shadow-[0_8px_22px_rgba(255,59,48,0.28)]"
              : "bg-grad-blue text-white shadow-tile"
          }`}
        >
          <Timer className="h-4 w-4" strokeWidth={2.4} />
        </span>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            模擬試験 残り時間
          </div>
          <div
            className={`num text-[26px] font-semibold leading-tight tracking-tight ${
              criticalLow ? "text-ios-red" : "text-foreground"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-muted">
        <div
          className={`h-full transition-[width] duration-700 ease-linear ${
            criticalLow
              ? "bg-gradient-to-r from-[#FF6B4A] to-[#FF3B30]"
              : "bg-gradient-to-r from-[#5E5CE6] to-[#0A84FF]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
