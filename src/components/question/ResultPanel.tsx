import Link from "next/link";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/lib/markdown";
import { WhyAttractiveCard } from "./WhyAttractiveCard";
import { MisconceptionBadges } from "./MisconceptionBadges";
import { RelatedTopics } from "./RelatedTopics";
import { RelatedMaterials } from "./RelatedMaterials";
import { Button } from "@/components/ui/button";

export type ResultPanelData = {
  isCorrect: boolean;
  selectedLabel: string;
  selectedChoice: {
    label: string;
    body: string;
    whyAttractive: string | null;
    misconceptionSlug: string | null;
  } | null;
  explanation: string;
  misconceptions: { slug: string; title: string }[];
  topics: { slug: string; title: string; summary: string }[];
  materials: { slug: string; title: string; body: string; role: string }[];
};

export function ResultPanel({
  data,
  nextHref,
}: {
  data: ResultPanelData;
  nextHref?: string;
}) {
  const selectedMisconception = data.misconceptions.find(
    (m) => m.slug === data.selectedChoice?.misconceptionSlug
  );

  return (
    <div className="space-y-4">
      <Card className={data.isCorrect ? "border-emerald-400" : "border-rose-400"}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {data.isCorrect ? (
              <>
                <Check className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-700">正解</span>
              </>
            ) : (
              <>
                <X className="h-5 w-5 text-rose-600" />
                <span className="text-rose-700">不正解</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Markdown>{data.explanation}</Markdown>
        </CardContent>
      </Card>

      {!data.isCorrect && data.selectedChoice?.whyAttractive && (
        <WhyAttractiveCard
          selectedLabel={data.selectedChoice.label}
          whyAttractive={data.selectedChoice.whyAttractive}
          misconceptionSlug={data.selectedChoice.misconceptionSlug ?? null}
          misconceptionTitle={selectedMisconception?.title}
        />
      )}

      <MisconceptionBadges items={data.misconceptions} />

      <div className="grid gap-4 md:grid-cols-2">
        <RelatedTopics items={data.topics} />
        <RelatedMaterials items={data.materials} />
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {data.selectedChoice?.misconceptionSlug && (
          <Button asChild variant="secondary">
            <Link
              href={`/learn/session/new?mode=weakness&misconception=${data.selectedChoice.misconceptionSlug}&count=5`}
            >
              この誤解パターンを5問だけ
            </Link>
          </Button>
        )}
        {nextHref && (
          <Button asChild>
            <Link href={nextHref}>次の問題へ</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
