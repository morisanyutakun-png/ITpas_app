import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ClipboardList,
  Cpu,
  BookOpen,
  Scale,
  TrendingUp,
  Network,
  Shield,
  Database,
  Cloud,
  Code2,
  Table2,
  Calculator,
  HardDrive,
  Workflow,
} from "lucide-react";

export const majorTheme: Record<
  string,
  { label: string; gradient: string; ring: string; chip: string; icon: LucideIcon }
> = {
  strategy: {
    label: "ストラテジ",
    gradient: "from-violet-500 to-fuchsia-500",
    ring: "ring-violet-300",
    chip: "bg-violet-100 text-violet-900 border-violet-200",
    icon: TrendingUp,
  },
  management: {
    label: "マネジメント",
    gradient: "from-sky-500 to-cyan-500",
    ring: "ring-sky-300",
    chip: "bg-sky-100 text-sky-900 border-sky-200",
    icon: ClipboardList,
  },
  technology: {
    label: "テクノロジ",
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-300",
    chip: "bg-emerald-100 text-emerald-900 border-emerald-200",
    icon: Cpu,
  },
};

export const formatTheme: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  definition: { label: "定義", icon: BookOpen, color: "text-slate-600" },
  comparison: { label: "比較", icon: Workflow, color: "text-indigo-600" },
  case: { label: "ケース", icon: Briefcase, color: "text-amber-600" },
  table_read: { label: "表読み取り", icon: Table2, color: "text-cyan-600" },
  calculation: { label: "計算", icon: Calculator, color: "text-rose-600" },
  pseudo_lang: { label: "擬似言語", icon: Code2, color: "text-fuchsia-600" },
  spreadsheet: { label: "表計算", icon: Table2, color: "text-emerald-600" },
  security_case: { label: "セキュリティ", icon: Shield, color: "text-red-600" },
  biz_analysis: { label: "経営分析", icon: TrendingUp, color: "text-violet-600" },
  law_ip: { label: "法務/知財", icon: Scale, color: "text-amber-700" },
  network_basics: { label: "ネットワーク", icon: Network, color: "text-sky-600" },
  db_basics: { label: "DB", icon: Database, color: "text-teal-600" },
};

export const cloudIconForTopic: Record<string, LucideIcon> = {
  cloud_service_models: Cloud,
  hw_storage_raid: HardDrive,
};

export function pickFormat(t: string) {
  return formatTheme[t] ?? formatTheme.definition;
}
export function pickMajor(t: string) {
  return majorTheme[t] ?? majorTheme.technology;
}

// Choice tile palette: each label has its own color so the eye learns
// "ア = blue tile" etc. Helps fast scanning during sessions.
export const choiceTheme: Record<
  string,
  { tile: string; ring: string; selected: string; label: string }
> = {
  ア: {
    tile: "bg-white hover:bg-blue-50 border-blue-200",
    ring: "ring-blue-400",
    selected: "bg-blue-50 border-blue-400 ring-2 ring-blue-400",
    label: "bg-blue-500 text-white",
  },
  イ: {
    tile: "bg-white hover:bg-emerald-50 border-emerald-200",
    ring: "ring-emerald-400",
    selected: "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400",
    label: "bg-emerald-500 text-white",
  },
  ウ: {
    tile: "bg-white hover:bg-amber-50 border-amber-200",
    ring: "ring-amber-400",
    selected: "bg-amber-50 border-amber-400 ring-2 ring-amber-400",
    label: "bg-amber-500 text-white",
  },
  エ: {
    tile: "bg-white hover:bg-rose-50 border-rose-200",
    ring: "ring-rose-400",
    selected: "bg-rose-50 border-rose-400 ring-2 ring-rose-400",
    label: "bg-rose-500 text-white",
  },
};
