import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LearnHubPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">学習ハブ</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/learn/session/new?mode=weakness&count=5">
          <Card className="hover:bg-accent transition">
            <CardHeader>
              <CardTitle>苦手タグから5問だけ</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              直近の誤答から、誤解パターン重み付きで5問を抽出します。
            </CardContent>
          </Card>
        </Link>
        <Link href="/learn/questions">
          <Card className="hover:bg-accent transition">
            <CardHeader>
              <CardTitle>問題一覧から探す</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              年度・大分類・論点・誤解パターンで絞り込み。
            </CardContent>
          </Card>
        </Link>
        <Link href="/topics">
          <Card className="hover:bg-accent transition">
            <CardHeader>
              <CardTitle>論点から探す</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              各論点の概要 → 関連問題に飛びます。
            </CardContent>
          </Card>
        </Link>
        <Link href="/misconceptions">
          <Card className="hover:bg-accent transition">
            <CardHeader>
              <CardTitle>誤解パターンから攻める</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              ひっかけパターンを定義から学んで、同じ誤解で落ちないようにします。
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
