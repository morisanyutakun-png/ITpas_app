import Link from "next/link";
import { Markdown } from "@/lib/markdown";

const ROLE_LABEL: Record<string, { label: string; cls: string }> = {
  primary: { label: "まずこれ", cls: "bg-ios-green/10 text-ios-green" },
  compare: { label: "比較表", cls: "bg-ios-blue/10 text-ios-blue" },
  helper: { label: "補助", cls: "bg-muted text-muted-foreground" },
};

export function RelatedMaterials({
  items,
}: {
  items: { slug: string; title: string; body: string; role: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="ios-section-label">補助資料</div>
      <div className="space-y-2">
        {items.map((m) => {
          const role = ROLE_LABEL[m.role] ?? ROLE_LABEL.helper;
          return (
            <div
              key={m.slug}
              className="rounded-2xl bg-card p-4 shadow-ios-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/materials/${m.slug}`}
                  className="truncate text-[14px] font-semibold text-foreground active:opacity-70"
                >
                  {m.title}
                </Link>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${role.cls}`}
                >
                  {role.label}
                </span>
              </div>
              <div className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                <Markdown>{m.body}</Markdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
