import Link from "next/link";
import { listTopics } from "@/server/queries/topics";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MAJOR_LABEL: Record<string, string> = {
  strategy: "ストラテジ系",
  management: "マネジメント系",
  technology: "テクノロジ系",
};

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const topics = await listTopics();
  const grouped = topics.reduce<Record<string, typeof topics>>((acc, t) => {
    (acc[t.majorCategory] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">論点マップ</h1>
      {Object.entries(grouped).map(([major, items]) => (
        <section key={major} className="space-y-3">
          <h2 className="text-lg font-semibold">{MAJOR_LABEL[major] ?? major}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((t) => (
              <Link key={t.slug} href={`/topics/${t.slug}`}>
                <Card className="hover:bg-accent transition">
                  <CardContent className="pt-6 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{t.minorTopic}</Badge>
                    </div>
                    <div className="font-medium">{t.title}</div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {t.summary}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
