import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic } from "@/server/queries/topics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getTopic(slug);
  if (!data) notFound();
  const { topic, materials, questions } = data;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="space-y-2">
        <div className="flex gap-2">
          <Badge variant="secondary">{topic.majorCategory}</Badge>
          <Badge variant="outline">{topic.minorTopic}</Badge>
        </div>
        <h1 className="text-2xl font-bold">{topic.title}</h1>
        <p className="text-muted-foreground">{topic.summary}</p>
      </header>

      {topic.body && (
        <Card>
          <CardContent className="pt-6">
            <Markdown>{topic.body}</Markdown>
          </CardContent>
        </Card>
      )}

      {materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">関連補助資料</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {materials.map((m) => (
              <Link
                key={m.slug}
                href={`/materials/${m.slug}`}
                className="block rounded-md border p-3 hover:bg-accent text-sm"
              >
                {m.title}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">この論点の問題</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">関連問題はまだありません。</p>
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
