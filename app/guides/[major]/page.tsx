import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getGuideForMajor, getMajorInfo } from "@/server/queries/guides";
import { pickMajor } from "@/lib/design";

export const dynamic = "force-dynamic";

const VALID = new Set(["strategy", "management", "technology"]);

export default async function GuideMajorPage({
  params,
}: {
  params: Promise<{ major: string }>;
}) {
  const { major } = await params;
  if (!VALID.has(major)) notFound();
  const info = getMajorInfo(major);
  if (!info) notFound();

  const data = await getGuideForMajor(major as "strategy" | "management" | "technology");
  const theme = pickMajor(major);
  const Icon = theme.icon;

  // Group topics by minorTopic (sub-area)
  const byMinor = data.topics.reduce<Record<string, typeof data.topics>>((acc, t) => {
    (acc[t.minorTopic] ||= []).push(t);
    return acc;
  }, {});

  return (
    <article className="space-y-8 max-w-3xl mx-auto">
      {/* Hero */}
      <header className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${theme.gradient} px-6 py-8 text-white shadow-lg`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30">
            <Icon className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-white/80">
              学習ガイド
            </div>
            <h1 className="text-2xl md:text-3xl font-black leading-tight">{info.label}</h1>
          </div>
        </div>
        <p className="text-sm text-white/90 leading-relaxed">{info.intro}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            {data.topics.length} 論点 / {data.totalQuestions} 問
          </span>
          <Link
            href={`/learn/questions?major=${major}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 hover:bg-white"
          >
            この領域の問題を解く
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Coverage */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          この領域でカバーする内容
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{info.coverage}</p>
      </section>

      {/* Topics by sub-area */}
      <section className="space-y-5">
        <h2 className="text-lg font-bold">論点リスト</h2>
        {Object.entries(byMinor).map(([minor, list]) => (
          <div key={minor} className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-700">{minor}</h3>
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-500">{list.length}件</span>
            </div>
            <div className="grid gap-2">
              {list.map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="group flex items-start justify-between gap-3 rounded-xl border-2 border-slate-100 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-slate-900">{t.title}</div>
                    <div className="text-xs text-slate-600 line-clamp-2 mt-0.5">{t.summary}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </article>
  );
}
