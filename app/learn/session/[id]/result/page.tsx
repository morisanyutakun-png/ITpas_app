import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";
import { getOrCreateAnonUser } from "@/lib/anonId";
import { finishSessionAction } from "@/server/actions/sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SessionResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getOrCreateAnonUser();
  const s = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });
  if (!s || s.userId !== user.id) notFound();

  if (!s.finishedAt) {
    await finishSessionAction(id);
  }

  const breakdown = await db.execute(sql`
    SELECT
      m.slug AS slug,
      m.title AS title,
      SUM(CASE WHEN a.result = 'incorrect' THEN 1 ELSE 0 END)::int AS incorrect,
      COUNT(*)::int AS attempted
    FROM attempts a
    JOIN question_misconceptions qm ON qm.question_id = a.question_id
    JOIN misconceptions m ON m.id = qm.misconception_id
    WHERE a.session_id = ${id}
    GROUP BY m.slug, m.title
    ORDER BY incorrect DESC
  `);

  const refreshed = await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  });
  const total = refreshed?.totalCount ?? 0;
  const correct = refreshed?.correctCount ?? 0;
  const rate = total ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>セッション結果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold">
            {correct} / {total}{" "}
            <span className="text-base text-muted-foreground">({rate}%)</span>
          </div>
          <p className="text-sm text-muted-foreground">{s.mode} モード</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">崩れた誤解パターン</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {breakdown.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">記録がありません。</p>
          ) : (
            breakdown.rows.map((r) => {
              const row = r as { slug?: string; title?: string; incorrect?: number; attempted?: number };
              return (
                <div
                  key={String(row.slug)}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <Link
                    href={`/misconceptions/${row.slug}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {row.title}
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={Number(row.incorrect) > 0 ? "destructive" : "success"}
                    >
                      {row.incorrect}/{row.attempted} 誤
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/learn/session/new?mode=weakness&misconception=${row.slug}&count=5`}
                      >
                        この誤解を5問
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button asChild>
          <Link href="/learn/session/new?mode=weakness&count=5">弱点5問を再挑戦</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">ダッシュボードへ</Link>
        </Button>
      </div>
    </div>
  );
}
