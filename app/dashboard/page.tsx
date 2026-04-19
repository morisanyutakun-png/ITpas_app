import Link from "next/link";
import { getOrCreateAnonUser } from "@/lib/anonId";
import {
  getProgressByMisconception,
  getProgressByTopic,
} from "@/server/queries/progress";
import { MisconceptionHeatmap } from "@/components/dashboard/MisconceptionHeatmap";
import { TopicHeatmap } from "@/components/dashboard/TopicHeatmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getOrCreateAnonUser();
  const [misc, topic] = await Promise.all([
    getProgressByMisconception(user.id),
    getProgressByTopic(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">理解ダッシュボード</h1>
        <Button asChild>
          <Link href="/learn/session/new?mode=weakness&count=5">弱点5問を解く</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">誤解パターン別ヒートマップ</CardTitle>
        </CardHeader>
        <CardContent>
          <MisconceptionHeatmap items={misc} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">論点別ヒートマップ</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicHeatmap items={topic} />
        </CardContent>
      </Card>
    </div>
  );
}
