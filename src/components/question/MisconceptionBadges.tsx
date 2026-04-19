import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function MisconceptionBadges({
  items,
}: {
  items: { slug: string; title: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">関連する誤解パターン</div>
      <div className="flex flex-wrap gap-2">
        {items.map((m) => (
          <Link key={m.slug} href={`/misconceptions/${m.slug}`}>
            <Badge variant="warn" className="hover:bg-amber-200 cursor-pointer">
              {m.title}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
