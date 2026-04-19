import Link from "next/link";
import { listMisconceptions } from "@/server/queries/misconceptions";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MisconceptionsPage() {
  const items = await listMisconceptions();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">誤解パターン辞書</h1>
      <p className="text-sm text-muted-foreground">
        ITパスポートで頻出するひっかけ・取り違えの典型例。問題ごとに紐付き、苦手分析の軸になります。
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((m) => (
          <Link key={m.slug} href={`/misconceptions/${m.slug}`}>
            <Card className="hover:bg-accent transition">
              <CardContent className="pt-6 space-y-1">
                <div className="font-medium">{m.title}</div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {m.definition}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
