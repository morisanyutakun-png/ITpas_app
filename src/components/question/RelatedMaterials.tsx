import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/lib/markdown";

const ROLE_LABEL: Record<string, string> = {
  primary: "まずこれを見る",
  compare: "似た概念との比較",
  helper: "補助",
};

export function RelatedMaterials({
  items,
}: {
  items: { slug: string; title: string; body: string; role: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          補助資料
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((m) => (
          <div key={m.slug} className="rounded-md border p-3">
            <div className="flex items-center justify-between mb-1">
              <Link
                href={`/materials/${m.slug}`}
                className="font-medium text-sm hover:underline"
              >
                {m.title}
              </Link>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {ROLE_LABEL[m.role] ?? m.role}
              </span>
            </div>
            <Markdown>{m.body}</Markdown>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
