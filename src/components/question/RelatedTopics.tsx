import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RelatedTopics({
  items,
}: {
  items: { slug: string; title: string; summary: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">関連する論点</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((t) => (
          <Link
            key={t.slug}
            href={`/topics/${t.slug}`}
            className="block rounded-md border p-3 hover:bg-accent"
          >
            <div className="font-medium text-sm">{t.title}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {t.summary}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
