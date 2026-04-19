import Link from "next/link";
import { notFound } from "next/navigation";
import { getMisconception } from "@/server/queries/misconceptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MisconceptionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getMisconception(slug);
  if (!data) notFound();
  const { misconception, questions } = data;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{misconception.title}</h1>
        <p className="text-muted-foreground">{misconception.definition}</p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">典型的なズレ方</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">{misconception.typicalExample}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">正しい理解</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">{misconception.counterExample}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">立て直し方</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">{misconception.recoveryHint}</CardContent>
      </Card>

      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/learn/session/new?mode=weakness&misconception=${slug}&count=5`}>
            この誤解パターンで5問
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">この誤解パターンに関連する問題</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">まだありません。</p>
          ) : (
            questions.map((q) => (
              <Link
                key={q.id}
                href={`/learn/questions/${q.id}`}
                className="block rounded-md border p-3 hover:bg-accent text-sm"
              >
                <div className="text-xs text-muted-foreground">
                  R{q.examYear} 第{q.questionNumber}問
                </div>
                <div className="line-clamp-1">{q.stem}</div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
