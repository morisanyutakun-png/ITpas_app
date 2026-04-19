import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { questions, topics } from "@/db/schema";

const MAJOR_INFO: Record<
  string,
  { slug: string; label: string; intro: string; coverage: string }
> = {
  strategy: {
    slug: "strategy",
    label: "ストラテジ系",
    intro:
      "経営戦略・マーケティング・法務・経営分析など、ビジネス側の論点群。略語が多く、対象（顧客／資源／市場）を取り違えやすいので『何を分析する手法か』を1語で答えられる状態を目指す。",
    coverage:
      "VRIO / SWOT / 4P / PPM / 3C などのフレームワーク、ROE/ROA/ROI/損益分岐点などの経営指標、PoC/PoV/MVP/プロトタイプの事業検証手法、著作権/特許/商標/個人情報保護法の法務、RFI/RFP/RFQ の調達文書。",
  },
  management: {
    slug: "management",
    label: "マネジメント系",
    intro:
      "プロジェクトマネジメントとサービスマネジメントが2大柱。WBS/ガント/PERT/クリティカルパスの『何を見せる図か』、ITIL の『インシデント管理 vs 問題管理』の境界が頻出。",
    coverage:
      "WBS / ガントチャート / アローダイアグラム / クリティカルパス、ITIL の主要プロセス（インシデント／問題／変更／構成／リリース）、SLA/SLO/SLM の違い。",
  },
  technology: {
    slug: "technology",
    label: "テクノロジ系",
    intro:
      "ネットワーク・セキュリティ・データベース・ハードウェア・新技術 (AI/VR) など。所属層・機能の境界・ACID 特性・暗号方式の使い分けが繰り返し問われる。",
    coverage:
      "OSI 7階層と各機器、TCP/UDP/DNS/DHCP/ARP/NAT、共通鍵/公開鍵/ハッシュとデジタル署名、マルウェア (ウイルス/ワーム/トロイ/ランサム)、認証 vs 認可、IaaS/PaaS/SaaS、DB 正規化と ACID、RAID 0/1/5/6/10、擬似言語・表計算、生成AI (ハルシネーション/AR/VR)。",
  },
};

export function listMajorGuides() {
  return Object.values(MAJOR_INFO);
}

export function getMajorInfo(slug: string) {
  return MAJOR_INFO[slug];
}

export async function getGuideForMajor(
  major: "strategy" | "management" | "technology"
) {
  const ts = await db
    .select({
      id: topics.id,
      slug: topics.slug,
      title: topics.title,
      minorTopic: topics.minorTopic,
      summary: topics.summary,
    })
    .from(topics)
    .where(eq(topics.majorCategory, major))
    .orderBy(asc(topics.minorTopic), asc(topics.title));

  const qCount = await db.execute(sql`
    SELECT COUNT(*)::int AS c
    FROM questions
    WHERE major_category = ${major}
  `);
  const total = Number((qCount.rows[0] as { c?: number } | undefined)?.c ?? 0);

  return { topics: ts, totalQuestions: total };
}
