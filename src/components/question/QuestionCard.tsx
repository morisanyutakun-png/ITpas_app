import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Markdown } from "@/lib/markdown";

const FORMAT_LABEL: Record<string, string> = {
  definition: "定義",
  comparison: "比較",
  case: "ケース",
  table_read: "表読み取り",
  calculation: "計算",
  pseudo_lang: "擬似言語",
  spreadsheet: "表計算",
  security_case: "セキュリティ事例",
  biz_analysis: "経営分析",
  law_ip: "法務/知財",
  network_basics: "ネットワーク基礎",
  db_basics: "DB基礎",
};

const MAJOR_LABEL: Record<string, string> = {
  strategy: "ストラテジ系",
  management: "マネジメント系",
  technology: "テクノロジ系",
};

export function QuestionCard({
  examYear,
  examSeason,
  questionNumber,
  majorCategory,
  formatType,
  stem,
}: {
  examYear: number;
  examSeason: "spring" | "autumn" | "annual";
  questionNumber: number;
  majorCategory: string;
  formatType: string;
  stem: string;
}) {
  const seasonLabel =
    examSeason === "spring" ? "春" : examSeason === "autumn" ? "秋" : "";
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            R{examYear}
            {seasonLabel} 第{questionNumber}問
          </Badge>
          <Badge variant="secondary">{MAJOR_LABEL[majorCategory] ?? majorCategory}</Badge>
          <Badge variant="secondary">{FORMAT_LABEL[formatType] ?? formatType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Markdown>{stem}</Markdown>
      </CardContent>
    </Card>
  );
}
