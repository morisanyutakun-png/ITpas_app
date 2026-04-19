import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { listMajorGuides } from "@/server/queries/guides";
import { pickMajor } from "@/lib/design";

export const metadata = { title: "学習ガイド" };

export default function GuidesIndex() {
  const guides = listMajorGuides();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">学習ガイド</h1>
        <p className="text-sm text-slate-600">
          ITパスポート3大領域の論点を、参考書のように体系的に整理。各論点詳細・補助資料・関連問題に飛べます。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {guides.map((g) => {
          const theme = pickMajor(g.slug);
          const Icon = theme.icon;
          return (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="group">
              <div className="relative h-full overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 hover:shadow-lg">
                <div
                  className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${theme.gradient} opacity-15 blur-2xl group-hover:opacity-30 transition`}
                />
                <div className="relative space-y-3">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-white shadow-md`}>
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold leading-snug">{g.label}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3">{g.intro}</p>
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-900 group-hover:translate-x-0.5 transition-transform">
                    <BookOpen className="h-4 w-4" />
                    ガイドを開く
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
