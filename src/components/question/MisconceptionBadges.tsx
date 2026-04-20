import Link from "next/link";

export function MisconceptionBadges({
  items,
}: {
  items: { slug: string; title: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl bg-card p-4 shadow-ios-sm">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        関連する誤解パターン
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((m) => (
          <Link
            key={m.slug}
            href={`/misconceptions/${m.slug}`}
            className="inline-flex items-center rounded-full bg-ios-orange/10 px-3 py-1 text-[13px] font-medium text-ios-orange active:opacity-70"
          >
            {m.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
