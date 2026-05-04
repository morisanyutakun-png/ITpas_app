import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Compass,
  PlayCircle,
  Target,
} from "lucide-react";
import { readCurrentUser } from "@/lib/currentUser";
import {
  getMisconception,
  getMisconceptionProgress,
} from "@/server/queries/misconceptions";
import { getMisconceptionArchetype } from "@/server/content/misconceptionArchetypeMap";
import { ARCHETYPE_META } from "@/lib/misconceptionArchetypes";

export const dynamic = "force-dynamic";

export default async function MisconceptionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await readCurrentUser();
  const [data, progress] = await Promise.all([
    getMisconception(slug),
    getMisconceptionProgress(slug, user?.id ?? null),
  ]);
  if (!data) notFound();
  const { misconception, questions } = data;
  const archetype = getMisconceptionArchetype(slug);
  const archetypeMeta = archetype ? ARCHETYPE_META[archetype] : null;
  const ArchetypeIcon = archetypeMeta?.icon;

  // Severity tone from personal incorrect rate.
  const personalized = progress.attempted >= 2;
  const rate = progress.rate;
  const hue = personalized
    ? rate >= 0.5
      ? "#FF3B30"
      : rate >= 0.3
      ? "#FF9500"
      : "#FFCC00"
    : "#AF52DE";
  const hueDim = personalized
    ? rate >= 0.5
      ? "rgba(255,59,48,0.12)"
      : rate >= 0.3
      ? "rgba(255,149,0,0.12)"
      : "rgba(255,204,0,0.14)"
    : "rgba(175,82,222,0.14)";

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <Link
        href="/misconceptions"
        className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground active:opacity-70"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="kicker !mt-0">Trap Dictionary</span>
      </Link>

      {/* ── Editorial hero ── */}
      <header className="editorial-card relative overflow-hidden p-6 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full opacity-[0.18] blur-3xl"
          style={{ background: hue }}
        />
        <div className="relative z-10 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.14em]">
              {archetypeMeta && ArchetypeIcon ? (
                <Link
                  href={`/misconceptions?archetype=${archetypeMeta.slug}`}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-transform active:scale-[0.97]"
                  style={{
                    background: archetypeMeta.hueDim,
                    color: archetypeMeta.hue,
                  }}
                >
                  <ArchetypeIcon className="h-3 w-3" strokeWidth={2.4} />
                  {archetypeMeta.label} 型
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{ background: hueDim, color: hue }}
                >
                  <AlertTriangle className="h-3 w-3" />
                  Trap Pattern
                </span>
              )}
              {questions.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                  <Target className="h-3 w-3" />
                  {questions.length}問で登場
                </span>
              )}
            </div>
            <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight text-balance sm:text-[32px]">
              {misconception.title}
            </h1>
            <p className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground text-pretty">
              {misconception.definition}
            </p>
          </div>

          {personalized && (
            <div className="rounded-2xl bg-card px-4 py-3 text-right ring-1 ring-black/[0.05] shadow-ios-sm dark:ring-white/[0.07]">
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: hue }}
              >
                Your Miss Rate
              </div>
              <div className="num mt-1 text-[28px] font-semibold leading-none tracking-tight">
                {Math.round(rate * 100)}
                <span className="ml-0.5 text-[12px] font-medium text-muted-foreground">
                  %
                </span>
              </div>
              <div className="mt-1 text-[10.5px] text-muted-foreground">
                {progress.incorrect}/{progress.attempted} で誤答
              </div>
            </div>
          )}
        </div>

        <div className="relative z-10 mt-5">
          <Link
            href={`/learn/session/new?mode=weakness&misconception=${slug}&count=5`}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background shadow-ios active:opacity-90"
          >
            <PlayCircle className="h-4 w-4" />
            このパターンで5問
          </Link>
        </div>
      </header>

      {/* ── Editorial 3-part anatomy ── */}
      <section className="space-y-3">
        <div className="rule-label">Anatomy of the Trap</div>
        <div className="grid gap-3 md:grid-cols-3">
          <AnatomyCard
            step="01"
            kicker="Typical Mistake"
            title="典型的なズレ方"
            body={misconception.typicalExample}
            hue="#FF3B30"
            hueDim="rgba(255,59,48,0.10)"
            icon={<AlertTriangle className="h-4 w-4" strokeWidth={2.2} />}
          />
          <AnatomyCard
            step="02"
            kicker="Correct Take"
            title="正しい理解"
            body={misconception.counterExample}
            hue="#34C759"
            hueDim="rgba(52,199,89,0.12)"
            icon={<CircleCheck className="h-4 w-4" strokeWidth={2.2} />}
          />
          <AnatomyCard
            step="03"
            kicker="Recovery"
            title="立て直し方"
            body={misconception.recoveryHint}
            hue="#0A84FF"
            hueDim="rgba(10,132,255,0.12)"
            icon={<Compass className="h-4 w-4" strokeWidth={2.2} />}
          />
        </div>
      </section>

      {/* ── Related questions ── */}
      <section className="space-y-3">
        <div className="rule-label">Seen In</div>
        {questions.length === 0 ? (
          <div className="surface-card px-5 py-8 text-center text-[13px] text-muted-foreground">
            まだ紐づく問題がありません。
          </div>
        ) : (
          <div className="surface-card divide-y divide-border overflow-hidden">
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`/learn/questions/${q.id}`}
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: hueDim, color: hue }}
                >
                  <Target className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="num text-[10.5px] font-medium text-muted-foreground">
                    R{q.examYear} · 問{q.questionNumber}
                  </div>
                  <div className="line-clamp-1 text-[13.5px]">{q.stem}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AnatomyCard({
  step,
  kicker,
  title,
  body,
  hue,
  hueDim,
  icon,
}: {
  step: string;
  kicker: string;
  title: string;
  body: string;
  hue: string;
  hueDim: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="surface-card relative overflow-hidden p-5">
      <div
        aria-hidden
        className="album-glyph pointer-events-none absolute right-[-6%] top-[-10%] text-[80px] opacity-[0.08]"
        style={{ color: hue }}
      >
        {step}
      </div>
      <div className="relative flex items-start gap-2">
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: hueDim, color: hue }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: hue }}
          >
            {kicker}
          </div>
          <div className="mt-0.5 text-[15px] font-semibold tracking-tight">
            {title}
          </div>
        </div>
      </div>
      <p className="relative mt-3 text-[13px] leading-relaxed text-foreground/85 text-pretty">
        {body || "—"}
      </p>
    </div>
  );
}
