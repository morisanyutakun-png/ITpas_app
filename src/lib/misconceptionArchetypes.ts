/**
 * 誤解パターンの「型」タクソノミー。
 *
 * IPA 過去問のひっかけは、表面的には個々の用語ペアの違いに見えるが、
 * 構造的には 5 つのパターンに集約できる。各 misconception は archetype を
 * 1 つ持ち、UI ではアイコン・色・名称で「型」を可視化する。
 *
 * 型の追加・改名は破壊的変更：問題側の参照と figbook UI の両方に影響する。
 */

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Layers,
  Shuffle,
  Repeat2,
  Crosshair,
} from "lucide-react";

export const MISCONCEPTION_ARCHETYPES = [
  "rephrase_trap",
  "hierarchy_mix",
  "contrast_swap",
  "order_reverse",
  "scope_misread",
] as const;

export type MisconceptionArchetype = (typeof MISCONCEPTION_ARCHETYPES)[number];

export type ArchetypeMeta = {
  slug: MisconceptionArchetype;
  label: string;
  shortLabel: string;
  description: string;
  hue: string;
  hueDim: string;
  icon: LucideIcon;
};

export const ARCHETYPE_META: Record<MisconceptionArchetype, ArchetypeMeta> = {
  rephrase_trap: {
    slug: "rephrase_trap",
    label: "言い換え罠",
    shortLabel: "言い換え",
    description:
      "正しそうに聞こえる別の用語と混同するパターン。同じ目的・同じ役割に見えるが定義が違う。",
    hue: "#FF9500",
    hueDim: "rgba(255,149,0,0.14)",
    icon: ArrowLeftRight,
  },
  hierarchy_mix: {
    slug: "hierarchy_mix",
    label: "階層混同",
    shortLabel: "階層",
    description:
      "「全体」と「その一部」、「上位概念」と「下位の一手段」を取り違えるパターン。",
    hue: "#5856D6",
    hueDim: "rgba(88,86,214,0.14)",
    icon: Layers,
  },
  contrast_swap: {
    slug: "contrast_swap",
    label: "対比錯誤",
    shortLabel: "対比",
    description:
      "ペアで覚える 2 つを入れ替えてしまうパターン。役割が逆。",
    hue: "#FF3B30",
    hueDim: "rgba(255,59,48,0.14)",
    icon: Shuffle,
  },
  order_reverse: {
    slug: "order_reverse",
    label: "順序逆転",
    shortLabel: "順序",
    description:
      "プロセスやフローの順番を逆にしてしまうパターン。「先・後」の取り違え。",
    hue: "#0A84FF",
    hueDim: "rgba(10,132,255,0.14)",
    icon: Repeat2,
  },
  scope_misread: {
    slug: "scope_misread",
    label: "範囲取り違え",
    shortLabel: "範囲",
    description:
      "適用範囲・対象を広げすぎ／狭めすぎるパターン。「どこまで効く制度か」の誤読。",
    hue: "#34C759",
    hueDim: "rgba(52,199,89,0.14)",
    icon: Crosshair,
  },
};

export function getArchetypeMeta(
  archetype: MisconceptionArchetype | null | undefined
): ArchetypeMeta | null {
  if (!archetype) return null;
  return ARCHETYPE_META[archetype] ?? null;
}

export const ARCHETYPE_ORDER: MisconceptionArchetype[] = [
  ...MISCONCEPTION_ARCHETYPES,
];
