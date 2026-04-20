import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function RelatedTopics({
  items,
}: {
  items: { slug: string; title: string; summary: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="ios-section-label">関連する論点</div>
      <div className="ios-list shadow-ios-sm">
        {items.map((t) => (
          <Link
            key={t.slug}
            href={`/topics/${t.slug}`}
            className="ios-row active:bg-muted/60"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium">{t.title}</div>
              {t.summary && (
                <div className="line-clamp-2 text-[12px] text-muted-foreground">
                  {t.summary}
                </div>
              )}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
