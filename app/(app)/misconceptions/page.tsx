import { readCurrentUser } from "@/lib/currentUser";
import { listMisconceptionsWithStats } from "@/server/queries/misconceptions";
import { getMisconceptionArchetype } from "@/server/content/misconceptionArchetypeMap";
import {
  MISCONCEPTION_ARCHETYPES,
  type MisconceptionArchetype,
} from "@/lib/misconceptionArchetypes";
import {
  MisconceptionsBrowser,
  type BrowserItem,
} from "./MisconceptionsBrowser";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "誤解パターン辞典",
  description:
    "ITパスポートで頻出するひっかけを「型」で整理。問題ごとに紐付き、苦手分析の軸になります。",
};

const ARCHETYPE_SET = new Set<string>(MISCONCEPTION_ARCHETYPES);

export default async function MisconceptionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ archetype?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const initialFilter =
    sp.archetype && ARCHETYPE_SET.has(sp.archetype)
      ? (sp.archetype as MisconceptionArchetype)
      : "all";

  const user = await readCurrentUser();
  const stats = await listMisconceptionsWithStats(user?.id ?? null);

  const items: BrowserItem[] = stats.map((m) => ({
    slug: m.slug,
    title: m.title,
    definition: m.definition,
    usageCount: m.usageCount,
    attempted: m.attempted,
    incorrectRate: m.incorrectRate,
    archetype: getMisconceptionArchetype(m.slug),
  }));

  return (
    <div className="space-y-7 pb-10">
      <header className="space-y-1.5 pt-1">
        <div className="kicker">Trap Dictionary</div>
        <h1 className="text-ios-large font-semibold leading-[1.05] tracking-tight">
          誤解パターン辞典
        </h1>
        <p className="text-[13.5px] text-muted-foreground text-pretty">
          頻出ひっかけを 5 つの「型」で整理。型を選ぶと、その構造に属する罠だけが並びます。
        </p>
      </header>

      <MisconceptionsBrowser items={items} initialFilter={initialFilter} />

      <div className="px-1 text-[11.5px] text-muted-foreground text-pretty">
        誤解パターンは、問題と 1対多 で紐付きます。タップで定義・典型例・回避ヒントを読めます。
      </div>
    </div>
  );
}
