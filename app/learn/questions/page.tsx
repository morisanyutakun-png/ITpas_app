import Link from "next/link";
import { listQuestions } from "@/server/queries/questions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function QuestionsListPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    major?: string;
    topic?: string;
    misconception?: string;
  }>;
}) {
  const sp = await searchParams;
  const items = await listQuestions({
    examYear: sp.year ? Number(sp.year) : undefined,
    majorCategory: sp.major as "strategy" | "management" | "technology" | undefined,
    topicSlug: sp.topic,
    misconceptionSlug: sp.misconception,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">問題一覧</h1>
        <div className="text-sm text-muted-foreground">{items.length}問</div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <FilterChip href="/learn/questions" label="すべて" active={!sp.year && !sp.major} />
        <FilterChip href="/learn/questions?major=strategy" label="ストラテジ系" active={sp.major === "strategy"} />
        <FilterChip href="/learn/questions?major=management" label="マネジメント系" active={sp.major === "management"} />
        <FilterChip href="/learn/questions?major=technology" label="テクノロジ系" active={sp.major === "technology"} />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          該当する問題がまだありません。<code>content/structured/questions/</code> に追加して <code>pnpm seed</code> を実行してください。
        </p>
      ) : (
        <div className="grid gap-3">
          {items.map((q) => (
            <Link key={q.id} href={`/learn/questions/${q.id}`}>
              <Card className="hover:bg-accent transition">
                <CardContent className="pt-6 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      R{q.examYear} 第{q.questionNumber}問
                    </Badge>
                    <Badge variant="secondary">{q.majorCategory}</Badge>
                    <Badge variant="secondary">{q.formatType}</Badge>
                  </div>
                  <p className="text-sm line-clamp-2">{q.stem}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
    >
      {label}
    </Link>
  );
}
