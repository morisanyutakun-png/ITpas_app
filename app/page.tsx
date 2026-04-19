import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          「過去問は解けるけど、なぜ間違えたかは説明できない」を終わらせる。
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          ITパスポートを<strong>"理解"</strong>で突破するための、
          誤答理由・論点関連・補助資料が紐付いた学習ノート。
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/learn/questions">今すぐ1問試す</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/learn">学習ハブへ</Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="text-sm font-semibold text-amber-700">差別化①</div>
            <h3 className="font-semibold">なぜその誤答が魅力的だったかを言語化</h3>
            <p className="text-sm text-muted-foreground">
              選んだ誤答ごとに「どの誤解で引き寄せられたか」を提示。丸暗記が壊れます。
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="text-sm font-semibold text-amber-700">差別化②</div>
            <h3 className="font-semibold">単元ではなく『誤解パターン』別ヒートマップ</h3>
            <p className="text-sm text-muted-foreground">
              『どの単元が弱いか』ではなく『どの誤解で落ちているか』を見える化。
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="text-sm font-semibold text-amber-700">差別化③</div>
            <h3 className="font-semibold">論点・比較表・補助資料へその場で1タップ</h3>
            <p className="text-sm text-muted-foreground">
              似た用語の比較表・擬似言語ミニ解説を問題から直接呼び出せます。
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
