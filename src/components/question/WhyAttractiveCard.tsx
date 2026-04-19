import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WhyAttractiveCard({
  selectedLabel,
  whyAttractive,
  misconceptionSlug,
  misconceptionTitle,
}: {
  selectedLabel: string;
  whyAttractive: string;
  misconceptionSlug: string | null;
  misconceptionTitle?: string | null;
}) {
  return (
    <Card className="border-amber-300 bg-amber-50/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          なぜ「{selectedLabel}」が魅力的に見えたか
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-amber-950">
        <p>{whyAttractive}</p>
        {misconceptionSlug && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-amber-900/70">この誤解パターン:</span>
            <Link href={`/misconceptions/${misconceptionSlug}`}>
              <Badge variant="warn" className="hover:bg-amber-200">
                {misconceptionTitle ?? misconceptionSlug}
              </Badge>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
